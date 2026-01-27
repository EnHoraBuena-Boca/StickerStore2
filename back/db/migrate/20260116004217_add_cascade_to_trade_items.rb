class AddCascadeToTradeItems < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :trade_items, :trades
    add_foreign_key :trade_items, :trades, on_delete: :cascade
  end
end
