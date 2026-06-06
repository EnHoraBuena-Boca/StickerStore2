class DropTrades < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :trade_items, name: :fk_rails_1326d80504

    drop_table :trades
  end
end
