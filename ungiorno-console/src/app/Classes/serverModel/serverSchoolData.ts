import {SchoolContacts} from '../schoolContacts';
import {TypeDef} from './typeDef';
import {ServerServiceData} from './serverServiceData';
import { ServerSection } from "./serverSection";
import { Bus } from '../bus';

export class ServerSchoolData {
    schoolId : string;
    appId : string;
    name : string;
    address : string;
    contacts : SchoolContacts;
    accessEmail : string;
    absenceTiming : string;
    retireTiming : string;
    absenceTypes : TypeDef[];
    frequentIllnesses : TypeDef[];
    services: ServerServiceData[];
    sections: ServerSection[];
    buses: Bus[];
    static readonly ILLNESS_VALUE : string = 'Malattia';
    static readonly FAMILY_MOTIVATION_VALUE : string = 'Motivi Familiari';
}


 // private Timing regularTiming, anticipoTiming, posticipoTiming;
    // private List<TypeDef> teacherNoteTypes;
    // private List<TypeDef> foodTypes;
    // private List<BusProfile> buses;

