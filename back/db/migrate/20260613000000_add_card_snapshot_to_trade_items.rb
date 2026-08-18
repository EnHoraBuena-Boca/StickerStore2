class AddCardSnapshotToTradeItems < ActiveRecord::Migration[8.0]
  class MigrationTradeItem < ActiveRecord::Base
    self.table_name = "trade_items"
  end

  class MigrationUserCard < ActiveRecord::Base
    self.table_name = "user_cards"
    self.primary_key = "uuid"
  end

  def up
    add_column :trade_items, :snapshot_card_name, :string
    add_column :trade_items, :snapshot_cardtype, :integer
    add_column :trade_items, :snapshot_season, :integer
    add_column :trade_items, :snapshot_api_id, :string

    MigrationTradeItem.reset_column_information

    MigrationTradeItem.find_each do |item|
      card = MigrationUserCard.find_by(uuid: item.user_card_id)
      next unless card

      item.update_columns(
        snapshot_card_name: card.card_name,
        snapshot_cardtype: card.cardtype,
        snapshot_season: card.season,
        snapshot_api_id: card.api_id
      )
    end
  end

  def down
    remove_column :trade_items, :snapshot_api_id
    remove_column :trade_items, :snapshot_season
    remove_column :trade_items, :snapshot_cardtype
    remove_column :trade_items, :snapshot_card_name
  end
end
