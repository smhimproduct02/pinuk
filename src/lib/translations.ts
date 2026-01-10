export type Language = 'en' | 'ms';

export type TranslationKey =
    | 'app_title'
    | 'join_btn'
    | 'admin_btn'
    | 'or'
    | 'join_title'
    | 'enter_name'
    | 'display_name'
    | 'lobby_title'
    | 'players'
    | 'host'
    | 'game_config'
    | 'total_players'
    | 'assigned'
    | 'start_game'
    | 'waiting_host'
    | 'admin_panel'
    | 'game_id'
    | 'kick'
    | 'next_phase'
    | 'victory'
    | 'defeat'
    | 'back_home'
    | 'you_died'
    | 'night_phase'
    | 'day_phase'
    | 'choose_victim'
    | 'choose_reveal'
    | 'choose_steal'
    | 'choose_swap'
    | 'vote_eliminate'
    | 'vote_cast'
    | 'confirm_action'
    | 'action_submitted'
    | 'revealed_info';

export const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        app_title: 'Werewolf',
        join_btn: 'Join as Player',
        admin_btn: 'Enter as Host',
        or: 'Or',
        join_title: 'Join the Village',
        enter_name: 'Enter your name',
        display_name: 'Display Name',
        lobby_title: 'LOBBY',
        players: 'Players',
        host: 'HOST',
        game_config: 'Game Configuration',
        total_players: 'Total Players',
        assigned: 'Assigned',
        start_game: 'START GAME',
        waiting_host: 'Waiting for Host',
        admin_panel: 'Admin Panel',
        game_id: 'GAME ID',
        kick: 'Kick',
        next_phase: 'Next Phase',
        victory: 'VICTORY',
        defeat: 'DEFEAT',
        back_home: 'Back to Home',
        you_died: 'YOU DIED',
        night_phase: 'Night Phase',
        day_phase: 'Day Phase',
        choose_victim: 'Choose a victim via majority vote.',
        choose_reveal: 'Choose a player to reveal their role.',
        choose_steal: 'Choose a player to steal their role.',
        choose_swap: 'Choose TWO players to swap their roles.',
        vote_eliminate: 'Vote to Eliminate',
        vote_cast: 'Vote Cast',
        confirm_action: 'Confirm Action',
        action_submitted: 'Action Submitted',
        revealed_info: 'Information'
    },
    ms: {
        app_title: 'Werewolf',
        join_btn: 'Masuk Game',
        admin_btn: 'Jadi Host',
        or: 'Atau',
        join_title: 'Jom Masuk Kampung',
        enter_name: 'Masukkan nama anda',
        display_name: 'Nama Player',
        lobby_title: 'LOBI',
        players: 'Player',
        host: 'HOST',
        game_config: 'Setting Game',
        total_players: 'Jumlah Player',
        assigned: 'Dah Set',
        start_game: 'MULA GAME',
        waiting_host: 'Tunggu Host Jap...',
        admin_panel: 'Panel Admin',
        game_id: 'ID GAME',
        kick: 'Tendang',
        next_phase: 'Fasa Seterusnya',
        victory: 'MENANG',
        defeat: 'KALAH',
        back_home: 'Balik Home',
        you_died: 'KO DAH MATI',
        night_phase: 'Malam',
        day_phase: 'Siang',
        choose_victim: 'Pilih mangsa untuk dibaham.',
        choose_reveal: 'Pilih player nak check role dia.',
        choose_steal: 'Pilih player nak curi role dia.',
        choose_swap: 'Pilih DUA player untuk tukar role.',
        vote_eliminate: 'Undi Buang',
        vote_cast: 'Dah Undi',
        confirm_action: 'Confirm Gerak',
        action_submitted: 'Settel',
        revealed_info: 'Maklumat'
    }
};
