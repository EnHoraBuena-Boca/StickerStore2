class RenameUserId < ActiveRecord::Migration[8.0]
  def change
    rename_column :users, :user_id, :id
  end
end
