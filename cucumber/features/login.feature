# Port of bdd/features/login.feature
Feature: Login

  Scenario: Login as standard_user
    Given I am on the login page
    When I log in as "standard_user" with password "secret_sauce"
    Then I should see the Products page
