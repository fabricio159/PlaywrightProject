# Port of bdd/features/login.feature
@login @logged-out
Feature: Login

  Scenario: Login as standard_user
    Given I am on the login page
    When I log in as "standard_user" with password "secret_sauce"
    Then I should see the Products page

  Scenario Outline: Invalid login shows an error: <case>
    Given I am on the login page
    When I log in as "<username>" with password "<password>"
    Then I should see the login error "<error>"

    Examples:
      | case                | username        | password       | error                                                                     |
      | locked out user     | locked_out_user | secret_sauce   | Epic sadface: Sorry, this user has been locked out.                       |
      | wrong password      | standard_user   | wrong_password | Epic sadface: Username and password do not match any user in this service |
      | empty username      |                 | secret_sauce   | Epic sadface: Username is required                                        |
      | empty password      | standard_user   |                | Epic sadface: Password is required                                        |

  Scenario: Login error can be dismissed
    Given I am on the login page
    When I log in as "locked_out_user" with password "secret_sauce"
    And I dismiss the login error
    Then the login error should not be shown

  Scenario: Protected page redirects to login when logged out
    When I go to "/inventory.html"
    Then I should see the login error "Epic sadface: You can only access '/inventory.html' when you are logged in."
