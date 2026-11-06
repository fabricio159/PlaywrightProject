@products
Feature: Products page

  # Starts logged in through storageState, no login steps needed.
  Background:
    Given I open the Products page

  Scenario: Lists items
    Then I should see 6 products

  Scenario: Can be sorted by price low to high
    When I sort the products by "Price (low to high)"
    Then the product prices should be in ascending order
