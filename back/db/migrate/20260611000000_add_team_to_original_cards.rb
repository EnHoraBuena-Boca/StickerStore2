class AddTeamToOriginalCards < ActiveRecord::Migration[8.0]
  def change
    add_column :original_cards, :team, :string, limit: 100
  end
end
