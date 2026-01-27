class CreateTrades < ActiveRecord::Migration[8.0]
  def change
    create_table :trades do |t|
      t.column :sender_approve, :boolean, default: false, null: false
      t.column :receiver_approve, :boolean, default: false, null: false
      t.integer :sender_id, null: false
      t.integer :receiver_id, null: false
      t.timestamps
  end
    add_foreign_key :trades, :users, column: :sender_id
    add_foreign_key :trades, :users, column: :receiver_id
  end
end
