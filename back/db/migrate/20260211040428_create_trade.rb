class CreateTrade < ActiveRecord::Migration[8.0]
  def change
    create_table :trades do |t|
      t.timestamps
    end
  end
end
