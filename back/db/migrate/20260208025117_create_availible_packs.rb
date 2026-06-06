class CreateAvailiblePacks < ActiveRecord::Migration[8.0]
  def change
    create_table :availible_packs do |t|
      t.column :packs_left, :integer, default: 0
      t.references :user
      t.timestamps
    end
  end
end
