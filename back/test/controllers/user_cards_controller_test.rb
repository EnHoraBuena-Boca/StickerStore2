require "test_helper"

class UserCardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user_card = user_cards(:one)
  end

  test "should get index" do
    get user_cards_url, as: :json
    assert_response :success
  end

  test "should create user_card" do
    assert_difference("UserCard.count") do
      post user_cards_url, params: { user_card: {} }, as: :json
    end

    assert_response :created
  end

  test "should show user_card" do
    get user_card_url(@user_card), as: :json
    assert_response :success
  end

  test "should update user_card" do
    patch user_card_url(@user_card), params: { user_card: {} }, as: :json
    assert_response :success
  end

  test "should destroy user_card" do
    assert_difference("UserCard.count", -1) do
      delete user_card_url(@user_card), as: :json
    end

    assert_response :no_content
  end
end
