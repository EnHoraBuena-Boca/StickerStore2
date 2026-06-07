class DropTradeItems < ActiveRecord::Migration[8.0]
  def change
    drop_table :trade_items
  end
end
