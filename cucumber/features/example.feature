# Port of tests/example.spec.js
@logged-out
Feature: Example

  Scenario: has title
    Given I am on the login page
    Then the page title should be "Swag Labs"

  Scenario: login as standard_user
    Given I am on the login page
    When I log in with the credentials from .env
    Then I should see the Products page
