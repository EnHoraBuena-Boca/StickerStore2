class CreateTradeParticipants < ActiveRecord::Migration[8.0]
  def change
    create_table :trade_participants do |t|
      t.references :trade
      t.references :user
      t.column :accept, :boolean, default: false
      t.timestamps
    end
  end
end
