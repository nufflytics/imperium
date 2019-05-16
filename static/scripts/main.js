window.starter_cards = [];
import tournament from './components/tournament.js';
import VueFlashMessage from './components/VueFlashMessage/index.js';
Vue.use(VueFlashMessage);


Vue.mixin({
  data () {
    return {
      rarityorder: {"Starter":10,"Common":5, "Rare":4, "Epic":3, "Legendary":2, "Unique":1},
      mixed_teams: [
        {"code":"aog", "tier_tax":10,  "name":"Alliance of Goodness",   "races":['Bretonnian' , 'Human', 'Dwarf', 'Halfling', 'Wood Elf'] },
        {"code":"au",  "tier_tax":-10, "name":'Afterlife United',       "races":['Undead','Necromantic','Khemri','Vampire']},
        {"code":"afs", "tier_tax":0,   "name":'Anti-Fur Society',       "races":['Kislev' , 'Norse', 'Amazon', 'Lizardman']},
        {"code":"cgs", "tier_tax":-10, "name":'Chaos Gods Selection',   "races":['Chaos' , 'Nurgle']},
        {"code":"cpp", "tier_tax":10,  "name":'Chaotic Player Pact',    "races":['Chaos' , 'Skaven', 'Dark Elf', 'Underworld']},
        {"code":"egc", "tier_tax":10,  "name":'Elfic Grand Coalition',  "races":['High Elf' , 'Dark Elf', 'Wood Elf', 'Pro Elf']},
        {"code":"fea", "tier_tax":0,   "name":'Far East Association',   "races":['Chaos Dwarf' , 'Orc', 'Goblin', 'Skaven', 'Ogre']},
        {"code":"hl",  "tier_tax":0,   "name":'Human League',           "races":['Bretonnian' , 'Human', 'Kislev', 'Norse', 'Amazon']},
        {"code":"sbr", "tier_tax":0,   "name":'Superior Being Ring',    "races":['Bretonnian' , 'High Elf', 'Vampire', 'Chaos Dwarf']},
        {"code":"uosp", "tier_tax":-10, "name":'Union of Small People',  "races":['Ogre' , 'Goblin','Halfling']},
        {"code":"vt",  "tier_tax":0, "name":'Violence Together',      "races":['Ogre' , 'Goblin','Orc', 'Lizardman']}
      ],
      card_types: ["Player","Training","Special Play","Staff"],
      show_starter:1,
    }
  },
  methods: { 
    rarityclass(rarity) {
      let klass;
      switch(rarity) {
        case "Common":
        case "Starter":
          klass = "table-light";
          break;
        case "Rare":
          klass = "table-info";
          break;
        case "Epic":
          klass = "table-danger";
          break;
        case "Legendary":
          klass = "table-warning";
          break;
        case "Unique":
          klass = "table-success";
          break;
      }
      return klass;
    },
    cardsValue(cards) {
      return cards.reduce((total, e)=> { return total+e.value},0);
    },
    starter_cards() {
      return window.starter_cards;
    },
    sortedCards(cards) {
      var order = this.rarityorder;
      function compare(a,b) {
        return (order[a.rarity] - order[b.rarity]) || a.name.localeCompare(b.name);
      }
      return cards.slice().sort(compare);
    },

    sortedCardsWithoutQuantity(cards,filter="",mixed_filter=true) {
      let tmp_cards;
      if (!this.show_starter) {
        tmp_cards =  cards.filter(function(i) { return i.id != null});
      }
      else {
        tmp_cards =  cards
      }
      if (filter!="") {
        tmp_cards =  tmp_cards.filter(function(i) { return i.card_type == filter});
      }

      if (this.selected_team!="All" && filter=="Player" && mixed_filter) {
        const races = this.mixed_teams.find((e) => { return e.name == this.selected_team }).races;
        tmp_cards =  tmp_cards.filter(function(i) { return i.race.split("/").some((r) => races.includes(r))});
      }
      return this.sortedCards(tmp_cards);
    },

    sortedCardsWithQuantity(cards,filter="") {
      let new_collection = {}
      const sorted = this.sortedCardsWithoutQuantity(cards,filter);
      for (let i=0, len = sorted.length; i<len; i++) {
        if (new_collection.hasOwnProperty(sorted[i].name)) {
          new_collection[sorted[i].name]['quantity'] += 1
        }
        else {
          new_collection[sorted[i].name] = {}
          new_collection[sorted[i].name]["card"] = sorted[i]
          new_collection[sorted[i].name]["quantity"] = 1
        }
      }
      return new_collection;
    },

    imgs_for_skill(skill) {
      let name;
      switch(skill) {
        case "Strength Up!":
        case "ST+":
        case "+ST":
          name = "IncreaseStrength";
          break;
        case "Agility Up!":
        case "AG+":
        case "+AG":
          name = "IncreaseAgility";
          break;
        case "Movement Up!":
        case "MA+":
        case "+MA":
          name = "IncreaseMovement";
          break;
        case "Armour Up!":
        case "AV+":
        case "+AV":
          name = "IncreaseArmour";
          break;
        case "Sidestep":
          name = "SideStep";
          break;
        case "Nerves of Steel":
          name = "NervesOfSteel";
          break;
        default:
          name = skill.replace(/[\s-]/g, '')
      }
      const url = "https://cdn2.rebbl.net/images/skills/";
      return "<img class=\"skill_icon\" src=\""+url+name+".png\" title=\""+skill+"\"></img>";  
    },

    skills_for_player(card) {
      if(card.card_type!="Player") {
        return card.name;
      }
      let reg = /(Guard|Mighty Blow|ST\+|\+ST|MA\+|\+MA|AG\+|\+AG|AV\+|\+AV|Block|Accurate|Strong Arm|Dodge|Juggernaut|Claw|Sure Feet|Break Tackle|Two Heads|Wrestle|Frenzy|Multiple Block|Tentacles|Pro|Strip Ball|Sure Hands|Stand Firm|Grab|Hail Mary Pass|Dirty Player)[ ,.]|(Block$)/g;
      let str;
      if(["Unique","Legendary"].includes(card.rarity)) {
        str = card.description
      } else {
        str = card.name
      }
      let matches=[];
      let match;
      while (match = reg.exec(str)) {
        if(!(match.input.match("Pro Elf") && match[1]=="Pro")) {
          if(match[1]) {
            matches.push(match[1]);
          } else if (match[2]) {
            matches.push(match[2]);
          }
        }

        if (reg.lastIndex === match.index) {
            reg.lastIndex++;
        }
      }
      return matches.map((s) => this.imgs_for_skill(s)).join("");
    },
    skills_for(card) {
      if(card.card_type=="Player") {
        return this.skills_for_player(card);
      }
      if(["Special Play", "Staff"].includes(card.card_type)) {
        return this.skills_for_player(card);
      } 
      let skills=[];
      switch(card.name) {
        case "Block Party":
          skills = ["Block","Block","Block"];
          break;
        case "Roger Dodger":
          skills = ["Dodge","Dodge","Dodge"];
          break;
        case "Packing a Punch":
          skills = ["MightyBlow","MightyBlow","MightyBlow"];
          break;
        case "Ballhawk":
          skills = ["Wrestle","Tackle","StripBall"];
          break;
        case "Roadblock":
          skills = ["Block","Dodge","StandFirm"];
          break;
        case "Cold-Blooded Killer":
          skills = ["MightyBlow","PilingOn"];
          break;
        case "Sniper":
          skills = ["Accurate","StrongArm"];
          break;
        case "A Real Nuisance":
          skills = ["SideStep","DivingTackle"];
          break;
        case "Insect DNA":
          skills = ["TwoHeads","ExtraArms"];
          break;
        case "Super Wildcard":
          skills = ["MVPCondition"];
          break;
        case "I Didn't Read The Rules":
          skills = ["MVPCondition"];
          break;
        case "Training Wildcard":
          skills = ["MVPCondition2"];
          break;
        default:
          skills = [card.name]
      }
      const imgs = skills.map((s) => {
        return this.imgs_for_skill(s);  
      })
      return imgs.join("");
    }
  },
  computed: {
  }
})

var app = new Vue({
    el: '#app',
    data () {
      return {
        coaches: [],
        selectedCoach: {
          short_name: "",
          account: {
            amount:0,
            transactions: []
          },
          tournaments:[],
          cards:[],
          id:0,
        },
        tournaments: [],
        selected_t_region:"",
        selected_t_state:"",
        selected_team:"All",
        coach_filter:"",
        menu: "Coaches",
        search_timeout: null,
        user:{},
        processing: false,
        leaderboard_loaded:false,
        leaderboard:[],
      }
    },
    components: {
      tournament,
    },
    delimiters: ['[[',']]'],
    methods: {
      updateTournament(tournament) {
        const idx = this.tournaments.findIndex(x => x.id === parseInt(tournament.id));
        Vue.set(this.tournaments, idx, tournament);
        this.selectCoach();
      },
      getCoach(id) {
        const path = "/coaches/"+id;
        axios.get(path)
          .then((res) => {
            const idx = this.coaches.findIndex(x => x.id === parseInt(id));
            Vue.set(this.coaches, idx, res.data);
            this.selectedCoach = this.coaches[idx];
          })
          .catch((error) => {
            console.error(error);
          });
      },
      getUser(id) {
        const path = "/me";
        axios.get(path)
          .then((res) => {
            this.user = res.data.user;
            this.$emit('loadedUser');
          })
          .catch((error) => {
            console.error(error);
          });
      },
      getCoaches() {
        const path = "/coaches";
        axios.get(path)
          .then((res) => {
            for(let i=0,len=res.data.length;i<len;i++) {
              res.data[i].cards = [];
              res.data[i].tournaments = [];
              res.data[i].account = {};
              res.data[i].account.transactions = [];
            }
            this.coaches = res.data;
            this.$nextTick(function() {
              this.$emit('loadedCoaches');
            })
          })
          .catch((error) => {
            console.error(error);
          });
      },
      getLeaderboard() {
        const path = "/coaches/leaderboard";
        axios.get(path)
          .then((res) => {
            this.leaderboard = res.data.sort((a,b) => b.collection_value - a.collection_value).slice(0,10);
          })
          .catch((error) => {
            console.error(error);
          });
      },
      getTournaments() {
        const path = "/tournaments";
        axios.get(path)
          .then((res) => {
            this.tournaments = res.data;
          })
          .catch((error) => {
            console.error(error);
          });
      },
      getStarterCards() {
        const path = "/cards/starter";
        axios.get(path)
          .then((res) => {
            window.starter_cards = res.data;
          })
          .catch((error) => {
            console.error(error);
          });
      },
      debounceCoachSearch(val){
        if(this.search_timeout) clearTimeout(this.search_timeout);
        var that=this;
        this.search_timeout = setTimeout(function() {
          that.coach_filter = val; 
        }, 300);
      },
      selectCoach() {
        const c = this.loggedCoach;
        if(c) {
          this.getCoach(this.loggedCoach.id);
        }
        else if(this.coaches.length>0){
          this.getCoach(this.coaches[0].id);
        }
      },
      tournamentsFor(coach) {
        return this.tournaments.filter((e)=>{
          return coach.tournaments.includes(e.id);
        })
      },
      is_duster() {
        return (this.loggedCoach.duster && this.loggedCoach.duster.type ? true : false);
      },
      is_in_duster(card) {
        return (this.is_duster() ? this.loggedCoach.duster.cards.includes(card.id) : false);
      },
      is_duster_full() {
        return (this.is_duster() ? this.loggedCoach.duster.cards.length==10 : false);
      },
      is_duster_open() {
        return (this.is_duster() && this.loggedCoach.duster.status=="OPEN" ? true : false);
      },
      dust_add(card) {
        this.dust("add",card);
      },
      dust_remove(card) {
        this.dust("remove",card);
      },
      dust_cancel() {
        this.dust("cancel");
      },
      dust_commit() {
        this.dust("commit");
      },
      dust(method,card) {
        let path;
        if(card) {
          path = "/duster/"+method+"/"+card.id;
        } else {
          path = "/duster/"+method;
        }
        let msg;
        this.processing=true;
        axios.get(path)
        .then((res) => {
            if(method=="add") {
                msg = "Card "+card.name+" flagged for dusting";
            } 
            else if(method=="remove") {
                msg = "Card "+card.name+" - dusting flag removed";
            }
            else if(method=="cancel") {
              msg = "Dusting cancelled";
            }
            else if(method=="commit") {
              const free_cmd = (res.data.type=="Tryouts" ? "!genpack player <type>" : "!genpack training or !genpack special");
              msg = "Dusting committed! Use "+free_cmd+" to generate a free pack!";
              this.getCoach(this.loggedCoach.id);
            }
            this.loggedCoach.duster=res.data;
            this.flash(msg, 'success',{timeout: 3000});
        })
        .catch((error) => {
            if (error.response) {
                this.flash(error.response.data.message, 'error',{timeout: 3000});
            } else {
                console.error(error);
            }
        })
        .then(() => {
            this.processing=false;
        });
    },
    },
    computed: {
      duster_type() {
        if(this.is_duster()) {
          return this.loggedCoach.duster.type;
        } else {
          return "No dusting in progress";
        }
      },
      orderedCoaches() {
        return this.coaches.sort(function(a,b) {
          return a.name.localeCompare(b.name);
        });
      },
      filteredCoaches() {
        return this.orderedCoaches.filter((coach) => {
          return coach.name.toLowerCase().includes(this.coach_filter.toLowerCase())
        })
      },
      filteredTournaments() {
        let filtered = this.tournaments;
        if(this.selected_t_region!="") {
          filtered = filtered.filter((e) => {
            return e.region.toLowerCase().replace(/\s/g, '') == this.selected_t_region
          })
        }
        if(this.selected_t_state=="full") {
          filtered = filtered.filter((e) => {
            return e.coach_limit == e.tournament_signups.filter((e) => { return e.mode=="active"}).length;
          })
        } else if (this.selected_t_state=="free") {
          filtered = filtered.filter((e) => {
            return e.coach_limit > e.tournament_signups.filter((e) => { return e.mode=="active"}).length;
          })
        }
        
        return filtered;
      },
      loggedCoach() {
        if (this.user.id) {
          const coach = this.coaches.find((e) => {
            return e.disc_id == this.user.id;
          })
          return coach;
        }
        else {
          return undefined;
        }
      }
    },
    watch: {
      menu: function(newMenu,oldMenu) {
        if(newMenu == "Leaderboard") {
          if(this.leaderboard_loaded==false) {
            this.getLeaderboard();
            this.leaderboard_loaded=true;
          }
        }
      }
    },
    mounted() {
      this.$on('loadedUser', this.selectCoach);
      this.$on('loadedCoaches', this.selectCoach);
      this.$on('updateTournament', this.updateTournament);
      this.$on('updateTournaments', this.getTournaments);
    },
    beforeMount() {
      this.getUser();
      this.getCoaches();
      this.getTournaments();
      this.getStarterCards();
    },
});
