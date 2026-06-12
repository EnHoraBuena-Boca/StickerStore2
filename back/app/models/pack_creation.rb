class PackCreation

  ## Old Rarity Logic ##
  # def pack_rarities
  #   pack = Array.new
  #   for index in 0..4
  #     rarity = rand(101)
  #     if rarity >= 99
  #       pack.insert(index, 3)
  #     elsif rarity >= 95 && rarity < 99
  #       pack.insert(index, 2)
  #     elsif rarity <95 && rarity >=70
  #       pack.insert(index, 1)
  #     else
  #       pack.insert(index, 0)
  #     end
  #   end
  #   return pack
  # end

  ## New Rarity Logic ##
  def pack_rarities
    Array.new(5) do
      roll = rand * 100

      if roll < 0.5
        3
      elsif roll < 3.0
        2
      elsif roll < 20.0
        1
      else
        0
      end
    end
  end


  def pack_cards
    pack = pack_rarities
    cards = Array.new
    for rarity in pack
      card = OriginalCard.find(
        OriginalCard.where(cardtype: rarity, approved: true).pluck(:id).sample
      )
      cards.append(card)
    end
    return cards
  end


end
