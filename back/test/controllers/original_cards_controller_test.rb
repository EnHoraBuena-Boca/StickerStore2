require "test_helper"

class OriginalCardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @original_card = original_cards(:one)
  end

  test "should get index" do
    get original_cards_url, as: :json
    assert_response :success
  end

  test "should create original_card" do
    assert_difference("OriginalCard.count") do
      post original_cards_url, params: { original_card: {} }, as: :json
    end

    assert_response :created
  end

  test "should show original_card" do
    get original_card_url(@original_card), as: :json
    assert_response :success
  end

  test "should update original_card" do
    patch original_card_url(@original_card), params: { original_card: {} }, as: :json
    assert_response :success
  end

  test "should destroy original_card" do
    assert_difference("OriginalCard.count", -1) do
      delete original_card_url(@original_card), as: :json
    end

    assert_response :no_content
  end
end
