Feature: Products

  # Starts logged in through storageState, no login steps needed.
  @Products
  Scenario: Products page lists items
    Given I open the Products lightweight page
    Then I should see the Products page
    And I should see 6 products
