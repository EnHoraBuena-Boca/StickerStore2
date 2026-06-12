class AddPacksAvailableToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :packs_available, :integer, null: false, default: 0
  end
end
