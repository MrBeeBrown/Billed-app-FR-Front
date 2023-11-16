/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import mockedStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test d'affichage de la page
    describe("When I went on Bills page and it is loading", () => {
      test("Then, Loading page should be rendered", () => {
        document.body.innerHTML = BillsUI({ loading: true })
        expect(screen.getByText("Loading...")).toBeVisible()
        document.body.innerHTML = ""
      })
    })

    // Test d'affichage du message d'erreur
    describe("When I am on Bills page but back-end send an error message", () => {
      test("Then, Error page should be rendered", () => {
        document.body.innerHTML = BillsUI({ error: "error message" })
        expect(screen.getByText("Erreur")).toBeVisible()
        document.body.innerHTML = ""
      })
    })

    // Test d'affichage de la modale IconEye
    describe("When I click on one eye icon", () => {
      test("Then a modal should open", async () => {
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        })
        )
        const billsPage = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        })
        document.body.innerHTML = BillsUI({ data: bills })
        const iconEyes = screen.getAllByTestId("icon-eye")
        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
        const modale = document.getElementById("modaleFile")
        $.fn.modal = jest.fn(() => modale.classList.add("show"))
        iconEyes.forEach(iconEye => {
          iconEye.addEventListener("click", () => handleClickIconEye(iconEye))
          userEvent.click(iconEye)
          expect(handleClickIconEye).toHaveBeenCalled()
          expect(modale).toHaveClass("show")
        })
      })
    })

    // Test création d'une note de frais
    describe("When I click on New Bill Button", () => {
      test("Then I should be sent on New Bill form", () => {
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        })
        )
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        })
        document.body.innerHTML = BillsUI({ data: bills })
        const buttonNewBill = screen.getByRole("button", {
          name: /Nouvelle note de frais/i,
        })
        expect(buttonNewBill).toBeTruthy()
        const handleClickNewBill = jest.fn(bills.handleClickNewBill)
        buttonNewBill.addEventListener("click", handleClickNewBill)
        userEvent.click(buttonNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
      })
    })
  })
})