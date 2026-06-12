class DropAvailiblePacks < ActiveRecord::Migration[8.0]
  def change
    drop_table :availible_packs do |t|
      t.integer :packs_left, default: 0
      t.references :user
      t.timestamps
    end
  end
end
