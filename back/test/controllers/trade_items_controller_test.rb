require "test_helper"

class TradeItemsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @trade_item = trade_items(:one)
  end

  test "should get index" do
    get trade_items_url, as: :json
    assert_response :success
  end

  test "should create trade_item" do
    assert_difference("TradeItem.count") do
      post trade_items_url, params: { trade_item: {} }, as: :json
    end

    assert_response :created
  end

  test "should show trade_item" do
    get trade_item_url(@trade_item), as: :json
    assert_response :success
  end

  test "should update trade_item" do
    patch trade_item_url(@trade_item), params: { trade_item: {} }, as: :json
    assert_response :success
  end

  test "should destroy trade_item" do
    assert_difference("TradeItem.count", -1) do
      delete trade_item_url(@trade_item), as: :json
    end

    assert_response :no_content
  end
end
