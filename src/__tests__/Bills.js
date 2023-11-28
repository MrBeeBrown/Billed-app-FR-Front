/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from "@testing-library/dom";
// import de la librairie pour l'envirronement de test
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

// mise en place d'un mock pour simuler le store
jest.mock("../app/Store", () => mockedStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);

      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => windowIcon);
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map(a => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });


    // Ajout des tests unitaires
   
    // Test du bouton "nouvelle note de frais"
    describe("When I click on New Bill Button", () => {
      test("Then I should be sent on New Bill form", () => {
        // On définie la fonction onNavigate pour charger les données de la page
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        // On définie la propriété localStorage de l'objet window pour utiliser une instance de stockage local "localStorageMock" pour les test
        Object.defineProperty(window, "localStorage", { 
          value: localStorageMock,
        });
        // On initialise ensuite les données de l'utilisateur pour les stocker en utilisant "window.localStorage.setItem"
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        // On crée une instance de l'objet "Bills" en lui passant les paramètres nécessaires: "document", "onNavigate", "store" et "localStorage"
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });
        // On charge les données de la page en utilisant BillsUI
        document.body.innerHTML = BillsUI({ data: bills });
        const buttonNewBill = screen.getByRole("button", {
          name: /nouvelle note de frais/i,
        });
        expect(buttonNewBill).toBeTruthy();
        const handleClickNewBill = jest.fn(bills.handleClickNewBill);
        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill); 
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    });
    // Test de la fonction handleClickIconEye
    describe("When I click on one eye icon", () => {
      test("Then a modal should open", async () => {
         // On définie la fonction onNavigate pour charger les données de la page
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        // On définie la propriété localStorage de l'objet window pour utiliser une instance de stockage local "localStorageMock" pour les test
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
         // On initialise ensuite les données de l'utilisateur pour les stocker en utilisant "window.localStorage.setItem"
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        // On crée une instance de l'objet "Bills" en lui passant les paramètres nécessaires: "document", "onNavigate", "store" et "localStorage"
        const billsPage = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        }); 
        // On charge les données
        document.body.innerHTML = BillsUI({ data: bills });
        // On récupère tous les éléménts du DOM ayant pour ID "icon-eye"
        const iconEyes = screen.getAllByTestId("icon-eye"); 
        // On créé la fonction jest pour gérer les clics sur ces éléments
        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
        // On récupère tous les éléménts du DOM ayant pour ID "modaleFile"
        const modale = document.getElementById("modaleFile");
        $.fn.modal = jest.fn(() => modale.classList.add("show")); 
        // On simule un clic sur chaque éléments
        iconEyes.forEach(iconEye => {
          iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
          userEvent.click(iconEye);
          // On vérifie que la fonction handleClickIconEye soit bien appelé 
          expect(handleClickIconEye).toHaveBeenCalled();
          // On vérifie que la modal soit bien affiché
          expect(modale).toHaveClass("show");
        });
      });
    });

    // Test pour vérifier si la page s'affiche correctement
    describe("When I went on Bills page and it is loading", () => {
      test("Then, Loading page should be rendered", () => {
        // On simule l'ouverture de la page et on modifie le contenu HTML avec les paramètres de BillUI soit la value true
        document.body.innerHTML = BillsUI({ loading: true });
        // On vérifie si le texte Loading... est visible sur la page en utilisant la fonction screen.getByText de la librairy "testing-library"
        expect(screen.getByText("Loading...")).toBeVisible();
        // On vide le contenu pour eviter les effets de bord dans le prochain test
        document.body.innerHTML = "";
      });
    });

    // Test pour vérifier si le message d'erreur s'affiche correctement
    describe("When I am on Bills page but back-end send an error message", () => {
      test("Then, Error page should be rendered", () => {
         // On simule l'ouverture de la page et on modifie le contenu HTML avec les paramètres de BillUI soit un objet contenant  error: "error message"
        document.body.innerHTML = BillsUI({ error: "error message" });
        // On vérifie si le texte Erreur est visible sur la page en utilisant la fonction screen.getByText de la librairy "testing-library" si le texte est visible c'est que la page erreutr est affiché 
        expect(screen.getByText("Erreur")).toBeVisible();
        // On vide le contenu pour eviter les effets de bord dans le prochain test
        document.body.innerHTML = "";
      });
    });

    // Test de la fonction getBills
    describe("When I navigate to Bills Page", () => {
      // On vérifie que la bills soit bien récupérée à partir de l'API
      test("fetches bills from mock API GET", async () => {
        jest.spyOn(mockedStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );

        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        
        await waitFor(() => screen.getByText("Mes notes de frais"));
        const newBillBtn = await screen.findByRole("button", {
          name: /nouvelle note de frais/i,
        });
        
        const billsTableRows = screen.getByTestId("tbody");
        // On vérifie l'existence du bouton "Nouvelle note de frais"
        expect(newBillBtn).toBeTruthy();
        // On vérifie l'existence d'un tableau de factures
        expect(billsTableRows).toBeTruthy();
        // On vérifie que le tableau contient 4 éléments
        expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
      });

      // Test de l'erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        // On attend que la promesse soit résolue
        await new Promise(process.nextTick);
        // On recherche le texte message d'erreur "Erreur 404" sur la page
        const message = screen.getByText(/Erreur 404/);
        // On vérifie que le message est présent dans la page.
        expect(message).toBeTruthy();
      });

      // Test de l'ereur 500
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        // On attend que la promesse soit résolue
        await new Promise(process.nextTick);
        // On recherche le message d'erreur "Erreur 500" sur la page
        const message = screen.getByText(/Erreur 500/);
        // On vérifie que le message est présent dans la page.
        expect(message).toBeTruthy();
      });
    });
  });
});
