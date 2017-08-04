import { Delega } from './Classes/delega';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Kid } from "./Classes/kid";
import { School } from "./Classes/school";
import { Teacher } from "./Classes/teacher";
import { Bus } from "./Classes/bus";
import { Time } from "./Classes/time";
import { Service } from "./Classes/service";
import { Group } from "./Classes/group";
import { Parent } from "./Classes/parent";

export class InMemoryDataService implements InMemoryDbService {
  // createDb() {
  //   var school = new School();
  //   school.id = "TN2000G"
  //   school.name = "Scuola Uno"
  //   school.address = "Via Dante 1, Citta, Provincia"
  //   school.telephone = "0461256985"
  //   school.email = "scuolauno@mail.com"
  //   school.kids = [
  //     new Kid("RSSMRO", "Mario", "Rossi"),
  //     new Kid("VRDGVN","Giovanni", "Verdi"),
  //     new Kid("BNCLGI","Luigi", "Bianchi"),
  //   ];
  //   school.teachers = [
  //     new Teacher("FSTANT", "Antonello", "Fausti"),
  //     new Teacher("FSTLGI","Luigi", "Festi"),
  //     new Teacher("FRRMNL","Emanuela", "Ferri"),
  //   ]
  //   school.buses = [
  //     new Bus("bus1", "Povo"),
  //     new Bus("bus2", "Gardolo"),
  //     new Bus("bus3", "Rovereto")
  //   ];
  //   school.servizi = [
  //     new Service("default", [new Time("mattutina", new Date(0, 0, 0, 9), new Date(0, 0, 0, 13)), new Time("pomeridiana", new Date(0, 0, 0, 13), new Date(0, 0, 0, 16))]), //9.00 to 13.00
  //     new Service("anticipo", [new Time("Fascia unica", new Date(0, 0, 0, 8, 30), new Date(0, 0, 0, 9, 30))]), //9.00 to 13.00
  //     new Service("posticipo", [new Time("Fascia unica", new Date(0, 0, 0, 15, 30), new Date(0, 0, 0, 17, 30))]), //9.00 to 13.00
  //   ]
  //   school.sections = [
  //     "Sezione1",
  //     "Sezione2",
  //     "Sezione3",
  //     "Sezione4",
  //   ];
  //   school.assenze = [
  //     "Malattia",
  //     "Vaccinazione",
  //     "Vacanza"
  //   ];
  //   return {school};
  // }

    createDb() {
      const school = [
        {
          id : "TN2000G",
          name : "Scuola Uno",
          address : "Via Dante 1, Citta, Provincia",
          telephone : "0461256985",
          email : "scuolauno@mail.com",
          kids : [
            new Kid("RSSMRO", "Mario", "Rossi", "Maschio", new Date('2013-07-23'), 'https://s-media-cache-ak0.pinimg.com/originals/ed/cb/7f/edcb7f2fc6cf61ef85713420ceb91565.jpg' , false, new Parent('GSTLRN', 'Lorenzo', 'Giusti', '', '', ''), new Parent('RSSFBO', 'Fabiola', 'Rossi', '', '', ''), null, [], [new Delega('GSTMRC', 'Marco', 'Giusti', '', '', '', 'Nonno/a', new Date('2017-08-01'), true)], [], true, []),
            new Kid("VRDGVN","Giovanni", "Verdi", "Maschio", new Date(), "https://s-media-cache-ak0.pinimg.com/originals/ed/cb/7f/edcb7f2fc6cf61ef85713420ceb91565.jpg"),
            new Kid("BNCLGI","Luigi", "Bianchi", "Maschio", new Date(), "https://s-media-cache-ak0.pinimg.com/originals/ed/cb/7f/edcb7f2fc6cf61ef85713420ceb91565.jpg"),
          ],
          teachers : [
            new Teacher("FSTANT", "Antonello", "Fausti", "1234", "", "", ""),
            new Teacher("FSTLGI","Luigi", "Festi", "5678", "", "", ""),
            new Teacher("FRRMNL","Emanuela", "Ferri", "0000", "", "", ""),
          ],
          buses : [
            new Bus("bus1", "Povo", []),
            new Bus("bus2", "Gardolo", []),
            new Bus("bus3", "Rovereto", [])
          ],
          servizi : [
            new Service("normale", [new Time("mattutina", new Date(0, 0, 0, 9), new Date(0, 0, 0, 13)), new Time("pomeridiana", new Date(0, 0, 0, 13), new Date(0, 0, 0, 16))], [], true), //9.00 to 13.00
            new Service("anticipo", [new Time("Fascia unica", new Date(0, 0, 0, 8), new Date(0, 0, 0, 9))]), 
            new Service("posticipo", [new Time("Fascia unica", new Date(0, 0, 0, 16), new Date(0, 0, 0, 18, 30))]), 
          ],
          assenze : [
            "Vaccinazione",
            "Vacanza"
          ],
          malattie: [
            "Morbillo",
            "Febbre",
            "Varicella"
          ],
          groups : [
            new Group("Gruppo1", [], false, []),
            new Group("Sezione1", [], true, []),
            new Group("Gruppo2", [], false, []),
            new Group("Sezione2", [], true, []),
            new Group("Sezione3", [], true, []),
            new Group("Sezione4", [], true, []),
          ],
          fermate:['Povo - polo scientifico', 'Piazza Dante - stazione fs', 'Piazza venezia', 'Via Travai'],
          malattia:true,
          familiari : true
        }
      ]
      return {school};
    }
}