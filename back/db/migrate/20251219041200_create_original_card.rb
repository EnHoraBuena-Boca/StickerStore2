class CreateOriginalCard < ActiveRecord::Migration[8.0]
  def change
    create_table :original_cards , primary_key: [:id]do |t|
      t.timestamps
      t.column :id, :integer, default: 0
      t.column :name, :string
      t.column :type, :integer, default: 0
      t.column :approved, :boolean, default: false
    end
  end
end
