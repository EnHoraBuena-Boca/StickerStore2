class DeleteOldTrades < ActiveRecord::Migration[8.0]
  def change
    drop_table :trades
  end
end
