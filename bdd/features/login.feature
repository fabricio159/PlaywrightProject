Feature: Login

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Login page loads with title, fields and Login button
    Given I am on the login page
    Then the page title should be "Swag Labs"
    And I should see the username and password fields
    And I should see the Login button

  @LoginPage @SmokeTest @RegressionTest @ProductsPage
  Scenario: Login as standard_user
    Given I am on the login page
    When I log in as "standard_user" with password "secret_sauce"
    Then I should see the Products page

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Login with a wrong password shows an error message
    Given I am on the login page
    When I log in as "standard_user" with password "wrong_password"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should stay on the login page

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Login with an unknown username shows an error message
    Given I am on the login page
    When I log in as "unknown_user" with password "secret_sauce"
    Then I should see the login error "Epic sadface: Username and password do not match any user in this service"
    And I should stay on the login page

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Login with an empty username shows 'Username is required'
    Given I am on the login page
    When I log in as "" with password "secret_sauce"
    Then I should see the login error "Epic sadface: Username is required"
    And I should stay on the login page

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Login with an empty password shows 'Password is required'
    Given I am on the login page
    When I log in as "standard_user" with password ""
    Then I should see the login error "Epic sadface: Password is required"
    And I should stay on the login page

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Login with locked_out_user shows a locked-out error
    Given I am on the login page
    When I log in as "locked_out_user" with password "secret_sauce"
    Then I should see the login error "Epic sadface: Sorry, this user has been locked out."
    And I should stay on the login page

  @LoginPage @SmokeTest @RegressionTest
  Scenario: Error message can be dismissed
    Given I am on the login page
    When I log in as "" with password ""
    Then I should see the login error "Epic sadface: Username is required"
    When I dismiss the login error
    Then I should not see a login error

  @LoginPage @SmokeTest @RegressionTest @InventoryPage
  Scenario: Accessing /inventory.html without logging in redirects to login with an error
    When I go to the Products page without logging in
    Then I should be redirected to the login page
    And I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."

  # Each special user can log in but breaks something else on purpose (the "quirk" column).
  # The quirks show up after login, so they are documented here, not tested.
  @LoginPage @SmokeTest @RegressionTest @InventoryPage @ProductsPage
  Scenario Outline: Special user <username> can log in
    Given I am on the login page
    When I log in as "<username>" with password "secret_sauce"
    Then I should see the Products page

    Examples:
      | username                | quirk                                                                            |
      | problem_user            | Every product shows the same image; sorting and some Add/Remove buttons fail     |
      | performance_glitch_user | Login and page loads are slow (about 5 seconds)                                  |
      | error_user              | Some actions fail, e.g. adding some products to the cart or finishing checkout  |
      | visual_user             | Visual bugs: misaligned elements, wrong images and prices                        |
