class CreateUserCards < ActiveRecord::Migration[8.0]
  def change
    create_table :user_cards, primary_key: [:uuid] do |t|
      t.timestamps
      t.references :user
      t.column :uuid, :binary, limit: 16
      t.column :cardtype, :integer, default: 0
      t.column :season, :integer
      t.column :api_id, :string
    end
  end
end
