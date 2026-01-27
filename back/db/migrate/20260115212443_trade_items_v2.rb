class TradeItemsV2 < ActiveRecord::Migration[8.0]
  def change
    create_table :trade_items do |t|
      t.binary :user_card_id, limit: 16, null: false
      t.references :trade, foreign_key: true

      t.timestamps
    end
  end
end
