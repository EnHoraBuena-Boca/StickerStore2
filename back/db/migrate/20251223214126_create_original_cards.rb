class CreateOriginalCards < ActiveRecord::Migration[8.0]
  def change
    create_table :original_cards, primary_key: [:id] do |t|
      t.timestamps
      t.column :id, :integer, auto_increment: true
      t.column :name, :string
      t.column :Cardtype, :integer, default: 0
      t.column :approved, :boolean, default: false
      t.column :api_id, :string
    end
  end
end
