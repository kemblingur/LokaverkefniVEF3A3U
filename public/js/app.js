// Framendahluti verkefnisins
// Angular module sem sér um allt dæmið
angular.module("contactsApp", ['ngRoute'])
    // Stillingar á routed
    .config(function($routeProvider) {
        $routeProvider
            // Skila til baka lista af contöctum við vefrót
            .when("/", {
                templateUrl: "list.html",
                controller: "listController",
                resolve: {
                    // Kalla á getAllContacts functioninn í module-inum sjálfum
                    contacts: function(Contacts) {
                        return Contacts.getAllContacts();
                    }
                }
            })
            //Skilgreini hvert þarf að fara til þess að búa til nýjan contact
            .when("/new/contact", {
                //nefni viðeingandi controller og sendi rétt template
                controller: "newController",
                templateUrl: "contact-form.html"
            })
            //route fyrir ýtarupplýsingar um einn contact
            .when("/contact/:contactId", {
                // segi hvaða controller á við og sendi rétt template
                controller: "editController",
                templateUrl: "contact.html"
            })
            //ef það er reynt að fá eitthvað annað route áframsendi ég notendan á vefrótina
            .otherwise({
                redirectTo: "/"
            })
    })
    //Silgreini þjónusturnar sem eru síðan notaðar í controllerunum
    .service("Contacts", function($http) {
        //getAllContacts skilar til baka öllum tengiliðunum
        this.getAllContacts = function() {
            //sendi getrequest á /contacts sem APInn mun svara með JSON objecti
            return $http.get("/contacts").
                then(function(response) {
                    //skila svarinu
                    return response;
                }, function(response) {
                    //nema það komi upp eitthvað vandamál
                    alert("Fann ekki tengiliðina");
                });
        }
        //createContact býr til tengilið. Tekur við json objecti
        this.createContact = function(contact) {
            // sendi post request á apann með viðeigandi upplýsingum
            return $http.post("/contacts", contact).
                then(function(response) {
                    //skila svari
                    return response;
                }, function(response) {
                    //nema það sé eitthvað vandamál
                    alert("Náði ekki að búa til tengiliðinn");
                });
        }
        // Sækir ýtarupplýsingar um tengilið út frá meðteknu ID
        this.getSingleContact = function(contactId) {
            //bý til URL úr IDinu
            var url = "/contacts/" + contactId;
            // sendi get request á urlinn
            return $http.get(url).
                // Skila til baka svari
                then(function(response) {
                    return response;
                }, function(response) {
                    // Nema það sé vandamál
                    alert("Fann ekki tengiliðinn");
                });
        }
        // editSingleContact tekur við upplýsingum um tengilið og breytir honum samkvæmt þeim
        this.editSingleContact = function(contact) {
            // bý til urlinn
            var url = "/contacts/" + contact._id;
            //logga id tengiliðsins
            console.log(contact._id);
            // sendi put request á urlinn
            return $http.put(url, contact).
                then(function(response) {
                    // skila svarinu
                    return response;
                }, function(response) {
                    // nema það hafi verið vandamál
                    alert("Náði ekki að breyta þessum tengilið");
                    console.log(response);
                });
        }
        // Eyðir tengilið útfrá ID
        this.deleteSingleContact = function(contactId) {
            // bý til réttan url út frá IDinu
            var url = "/contacts/" + contactId;
            // sendi delete request á réttan url
            return $http.delete(url).
                then(function(response) {
                    // skila svari
                    return response;
                }, function(response) {
                    // nema vandamál
                    alert("Náði ekki að eyða þessum tengilið");
                    console.log(response);
                });
        }
    })
    // Þrír controllerar. Einn til að fá allan listan. Einn til að breyta tengiliðum. Einn til að stofna nýja tengiliði
    // listControllerinn sendir einfaldlega viðeigandi gögn á réttan stað
    .controller("listController", function(contacts, $scope) {
        $scope.contacts = contacts.data;
    })
    // NewController sér um að taka við gögnunum og skila þeim til réttar aðferðar
    .controller("newController", function($scope, $location, Contacts) {
        $scope.saveContact = function(contact) {
            // Sendi réttar upplýsingar í create aðferðina
            Contacts.createContact(contact).then(function(doc) {
                // og sendi notendan síðan á ýtarsíðuna fyrir þann notenda
                var contactUrl = "/contact/" + doc.data._id;
                $location.path(contactUrl);
            }, function(response) {
                // ef það er response, kemur það fram í alert
                alert(response);
            });
        }
    })
    // EditControllerinn sér um að breyta og eyða tengiliðum
    .controller("editController", function($scope, $routeParams, Contacts) {
        Contacts.getSingleContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
        }, function(response) {
            alert(response);
        });
        //sendi rétt template þegar verið er að breyta contact
        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.contactFormUrl = "contact-form.html";
        }
        // sendi ekkert template þegar contact er vistaður
        $scope.saveContact = function(contact) {
            Contacts.editSingleContact(contact);
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }
        // kalla á deleteaðferðina þegar að beðið er um hana
        $scope.deleteSingleContact = function(contactId) {
            Contacts.deleteSingleContact(contactId);
        }
    });