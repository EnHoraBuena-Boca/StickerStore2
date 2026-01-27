require "test_helper"

class TradesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @trading = trades(:one)
  end

  test "should get index" do
    get tradings_url, as: :json
    assert_response :success
  end

  test "should create trading" do
    assert_difference("Trading.count") do
      post tradings_url, params: { trading: {} }, as: :json
    end

    assert_response :created
  end

  test "should show trading" do
    get trading_url(@trading), as: :json
    assert_response :success
  end

  test "should update trading" do
    patch trading_url(@trading), params: { trading: {} }, as: :json
    assert_response :success
  end

  test "should destroy trading" do
    assert_difference("Trade.count", -1) do
      delete trading_url(@trading), as: :json
    end

    assert_response :no_content
  end
end
