# Port of bdd/features/cart.feature
@cart
Feature: Cart

  # Starts logged in through storageState, with an empty cart.
  Scenario: Added product shows in the cart
    Given I open the Products page
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1
    When I open the cart
    Then the cart should contain "Sauce Labs Backpack"
