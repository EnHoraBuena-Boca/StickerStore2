Rails.application.routes.draw do
  resources :user_cards
  resources :original_cards
  resources :users
  #API routes should be in /api/v1
  namespace :api do
    namespace :v1 do
        post 'login', to: 'users#login'
        get 'me', to: 'users#me'
        get 'unapproved', to: 'original_cards#unapproved'
        post 'approved', to: 'original_cards#approved'
        get 'pack', to: 'user_cards#pack'
        get 'get_user_card_count', to: 'user_cards#get_user_card_count'
        post 'cards_with_params', to: 'user_cards#cards_with_params'

        resources :users, :original_cards, :user_cards
    end
  end 
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
