class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, primary_key: [:user_id] do |t|
      t.column :user_id, :integer,  auto_increment: true
      t.column :status, :integer, default: 0
      t.column :first_name, :string
      t.column :password, :string
      t.timestamps
    end
  end
end
