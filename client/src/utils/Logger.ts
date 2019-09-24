import moment from 'moment';
import { LOG_LEVEL, LogLevel } from '../config/constants';



//const DB_LOG_ENABLED:boolean = true;
export class Logger {

    
    private name:string;

    constructor(name:string){
        this.name = name;
    }

    trace(message?:any, ...optionalParams:any[]){
        if(LOG_LEVEL>=LogLevel.TRACE){
            console.trace('[TRACE] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message),...optionalParams);
        }
    }

    debug(message?:any, ...optionalParams:any[]){
        if(LOG_LEVEL>=LogLevel.DEBUG){
            console.debug('[DEBUG] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message),...optionalParams);  //
        }
    }

    log(message?:any, ...optionalParams:any[]) {
        if(LOG_LEVEL>=LogLevel.LOG){
            console.log('[LOG] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message),...optionalParams); //,...optionalParams
        }
    }

    info(message?:any, ...optionalParams:any[]){
        if(LOG_LEVEL>=LogLevel.INFO){            
            console.log('[INFO] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message),...optionalParams);   //,...optionalParams            
        }
    }

    warn(message?:any, ...optionalParams:any[]){
        if(LOG_LEVEL>=LogLevel.WARN){
            console.log('[WARN] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message),...optionalParams); //...optionalParams
        }      
    }

    error(message?:any, ...optionalParams:any[]){
        //if(DB_LOG_ENABLED){
            //createUserLog({logType:LogTypeEnum.ERROR,content:message})
        //}
        if(LOG_LEVEL>=LogLevel.ERROR){
            //console.log('[ERROR] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message)); //...optionalParams
            console.log('[ERROR] '.concat(moment().format('HH:mm:ss.SSS')).concat(' '+this.name+' - ').concat(message).concat(' error2=').concat(...optionalParams[0].message)); //
        }        
    }

}