class AddNameToUserCards < ActiveRecord::Migration[8.0]
  def change
    add_column :user_cards, :card_name, :string
  end
end
