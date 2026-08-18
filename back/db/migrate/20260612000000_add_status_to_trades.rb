class AddStatusToTrades < ActiveRecord::Migration[8.0]
  def up
    add_column :trades, :status, :integer, null: false, default: 0
    add_index :trades, :status

    execute <<~SQL.squish
      UPDATE trades
      SET status = 1
      WHERE EXISTS (
        SELECT 1
        FROM trade_participants
        WHERE trade_participants.trade_id = trades.id
      )
      AND NOT EXISTS (
        SELECT 1
        FROM trade_participants
        WHERE trade_participants.trade_id = trades.id
          AND trade_participants.accept = FALSE
      )
    SQL
  end

  def down
    remove_index :trades, :status
    remove_column :trades, :status
  end
end
