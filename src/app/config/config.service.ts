import { Injectable } from '@angular/core';
import { ConfigServiceService } from '../../api';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private configServiceService: ConfigServiceService) { }

  public getMachineTypeByValue(value: string) {
    return this.configServiceService.getConfig().pipe(
        map(res => {
          return res.nodePool.options.find(option => option.value === value);
        }
      ));
  }
}
