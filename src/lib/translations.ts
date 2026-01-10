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
    | 'desc_werewolf'
    | 'desc_villager'
    | 'desc_seer'
    | 'desc_robber'
    | 'desc_troublemaker'
    | 'desc_minion'
    | 'desc_tanner'
    | 'desc_drunk'
    | 'desc_insomniac'
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
        revealed_info: 'Information',
        desc_werewolf: 'Team Werewolf. Wake up at night and see other wolves. Trick the village.',
        desc_villager: 'Team Village. No abilities at night. Find the wolves during the day.',
        desc_seer: 'Team Village. Check 1 player\'s card OR 2 center cards at night.',
        desc_robber: 'Team Village. Swap your card with another player and view your new role.',
        desc_troublemaker: 'Team Village. Swap cards between two other players without looking.',
        desc_minion: 'Team Werewolf. See the wolves but they don\'t see you. Win if wolves win.',
        desc_tanner: 'Neutral. You hate your life. Your goal is to get eliminated.',
        desc_drunk: 'Team Village. You are so drunk. Swap your card with a center card blindly.',
        desc_insomniac: 'Team Village. Wake up last to see if your role card has changed.'
    },
    ms: {
        app_title: 'Werewolf',
        join_btn: 'Masuk Game',
        admin_btn: 'Jadi Host',
        or: 'Atau',
        join_title: 'Jom Masuk Kampung',
        enter_name: 'Nama kau siapa?',
        display_name: 'Nama',
        lobby_title: 'LOBI',
        players: 'Orang Kampung',
        host: 'TUKANG JAGABELIA',
        game_config: 'Setting Game',
        total_players: 'Jumlah Orang',
        assigned: 'Role Dah Set',
        start_game: 'MULA GAME',
        waiting_host: 'Tunggu Host Jap...',
        admin_panel: 'Panel Admin',
        game_id: 'KOD BILIK',
        kick: 'Tendang',
        next_phase: 'Fasa Seterusnya',
        victory: 'MENANG',
        defeat: 'KALAH',
        back_home: 'Balik Asal',
        you_died: 'KO DAH MATI',
        night_phase: 'Malam',
        day_phase: 'Siang',
        choose_victim: 'Pilih siapa nak dibaham.',
        choose_reveal: 'Pilih member nak check role dia.',
        choose_steal: 'Pilih member nak curi role dia.',
        choose_swap: 'Pilih DUA member untuk tukar role.',
        vote_eliminate: 'Undi Buang',
        vote_cast: 'Dah Undi',
        confirm_action: 'Confirm Gerak',
        action_submitted: 'Beres',
        revealed_info: 'Rahsia Terbongkar',
        desc_werewolf: 'Geng Serigala. Bangun malam cam member lain. Tipu orang kampung.',
        desc_villager: 'Orang Kampung. Takde power apa pun. Cari serigala siang nanti.',
        desc_seer: 'Geng Kampung. Boleh tengok 1 kad player ATAU 2 kad tengah.',
        desc_robber: 'Geng Kampung. Tukar kad kau dengan orang lain, pastu tengok kad baru.',
        desc_troublemaker: 'Geng Kampung. Tukar kad antara dua player lain. Diorang takkan tau.',
        desc_minion: 'Geng Serigala. Kau nampak serigala, tapi diorang tak nampak kau.',
        desc_tanner: 'Neutral. Kau fedup hidup. Menang kalau kau kena buang.',
        desc_drunk: 'Geng Kampung. Mabuk ketum. Tukar kad kau dengan kad tengah buta-buta.',
        desc_insomniac: 'Geng Kampung. Bangun last sekali check kad sendiri kot-kot berubah.'
    }
};
