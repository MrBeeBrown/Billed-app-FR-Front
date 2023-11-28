/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
	Object.defineProperty(window, "localStorage", {
		value: localStorageMock,
	});
	window.localStorage.setItem(
		"user",
		JSON.stringify({
			type: "Employee",
		})
	);
	const root = document.createElement("div");
	root.setAttribute("id", "root");
	document.body.append(root);
	router();

	describe("When I am on NewBill Page", () => {
		test("Then Title text content should be displayed", async () => {
			window.onNavigate(ROUTES_PATH.NewBill);

			expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
		});

		test("Then mail icon in vertical layout should be highlighted", async () => {
			window.onNavigate(ROUTES_PATH.NewBill);

			await waitFor(() => screen.getByTestId("icon-mail"));
			const mailIcon = screen.getByTestId("icon-mail");
			expect(mailIcon.className).toBe("active-icon");
		});
	});

	describe("when I submit the form with empty fields", () => {
		test("then I should stay on new 'Bill page'", () => {
			// Navigate to the new page
			window.onNavigate(ROUTES_PATH.NewBill);
			// Create instant of newBill
			const newBill = new NewBill({
				document,
				onNavigate,
				mockStore,
				localStorage: window.localStorage,
			});

			expect(screen.getByTestId("expense-name").value).toBe("");
			expect(screen.getByTestId("datepicker").value).toBe("");
			expect(screen.getByTestId("amount").value).toBe("");
			expect(screen.getByTestId("vat").value).toBe("");
			expect(screen.getByTestId("pct").value).toBe("");
			expect(screen.getByTestId("file").value).toBe("");

			const form = screen.getByTestId("form-new-bill");
			// mock the function handleSubmit
			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

			form.addEventListener("submit", handleSubmit);
			fireEvent.submit(form);
			expect(handleSubmit).toHaveBeenCalled();
			expect(form).toBeTruthy();
		});
	});
	describe("When I am on NewBill page and I submit a wrong attached file format", () => {
		// DOM
		document.body.innerHTML = NewBillUI();

		const newBillContent = new NewBill({
			document,
			onNavigate,
			firestore: null,
			localStorage: window.localStorage,
		});

		const handleChangeFile = jest.fn(newBillContent.handleChangeFile);

		const attachedFile = screen.getByTestId("file");
		attachedFile.addEventListener("change", handleChangeFile);
		fireEvent.change(attachedFile, {
			target: { files: [new File(["file.pdf"], "file.pdf", { type: "image/pdf" })] },
		});

		// [BUG HUNT] - Bills
		expect(handleChangeFile).toHaveBeenCalled();
		expect(attachedFile.files[0].name).toBe("file.pdf");

		// get DOM element
		const errorMsg = screen.getByTestId("errorMsg");

		expect(errorMsg.textContent).toEqual(
			expect.stringContaining("Formats acceptés : .jpg, .jpeg, .png")
		);

		//* format valid
		test("Then it should accept the file when it as the right format", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			const root = document.createElement("div");
			root.setAttribute("id", "root");

			document.body.append(root);

			router();
			window.onNavigate(ROUTES_PATH.NewBill);

			const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

			const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

			const file = screen.getAllByTestId("file")[1];
			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [
						new File(["anything"], "text.png", {
							type: "image/png",
						}),
					],
				},
			});

			expect(handleChangeFile).toHaveBeenCalled();
			expect(handleChangeFile).toBeTruthy();
		});
	});
});

//** Test d'intégration (POST)

describe("Given I am a user connected as Employee", () => {
	describe("When I add a new bill", () => {
		test("Then it creates a new bill", () => {
			document.body.innerHTML = NewBillUI();
			//Initialisation des champs Bills
			const inputData = {
				type: "Transports",
				name: "test",
				datepicker: "2022-06-27",
				amount: "76",
				vat: "70",
				pct: "20",
				commentary: "test",
				file: new File(["test"], "test.png", { type: "image/png" }),
			};
			//On récupère les éléments
			const formNewBill = screen.getByTestId("form-new-bill");
			const inputExpenseName = screen.getByTestId("expense-name");
			const inputExpenseType = screen.getByTestId("expense-type");
			const inputDatepicker = screen.getByTestId("datepicker");
			const inputAmount = screen.getByTestId("amount");
			const inputVat = screen.getByTestId("vat");
			const inputPct = screen.getByTestId("pct");
			const inputCommentary = screen.getByTestId("commentary");
			const inputFile = screen.getByTestId("file");

			//On simule les valeurs
			fireEvent.change(inputExpenseName, { target: { value: inputData.name } });
			expect(inputExpenseName.value).toBe(inputData.name);

			fireEvent.change(inputExpenseType, { target: { value: inputData.type } });
			expect(inputExpenseType.value).toBe(inputData.type);

			fireEvent.change(inputDatepicker, { target: { value: inputData.datepicker } });
			expect(inputDatepicker.value).toBe(inputData.datepicker);

			fireEvent.change(inputAmount, { target: { value: inputData.amount } });
			expect(inputAmount.value).toBe(inputData.amount);

			fireEvent.change(inputVat, {
				target: { value: inputData.vat },
			});
			expect(inputVat.value).toBe(inputData.vat);

			fireEvent.change(inputPct, { target: { value: inputData.pct } });
			expect(inputPct.value).toBe(inputData.pct);

			fireEvent.change(inputCommentary, { target: { value: inputData.commentary } });
			expect(inputCommentary.value).toBe(inputData.commentary);

			userEvent.upload(inputFile, inputData.file);
			expect(inputFile.files[0]).toStrictEqual(inputData.file);
			expect(inputFile.files).toHaveLength(1);

			//On rempli localStorage avec les données de formulaire
			Object.defineProperty(window, "localStorage", {
				value: { getItem: jest.fn(() => JSON.stringify({ email: "email@test.com" })) },
				writable: true,
			});
			//On simule la navigation
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			//Initialisation
			const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });

			//On déclenche l'évènement
			const handleSubmit = jest.fn(newBill.handleSubmit);
			formNewBill.addEventListener("submit", handleSubmit);
			fireEvent.submit(formNewBill);
			expect(handleSubmit).toHaveBeenCalled();
		});

		test("Then it fails with a 404 error", async () => {
			const html = BillsUI({ error: "Erreur 404" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});

		test("Then it fails with a 500 error", async () => {
			const html = BillsUI({ error: "Erreur 500" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});