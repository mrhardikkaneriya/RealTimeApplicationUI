import { Pipe, PipeTransform } from '@angular/core';
import { MoneyPipeConstants } from '../constants/app.constants';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    if (!value) {
      return args[0] + '0';
    }

    if (value >= 10000000) {
      return args[0] + (value / 10000000).toFixed(2) + MoneyPipeConstants.Cr;
    } else if (value >= 100000) {
      return args[0] + (value / 100000).toFixed(2) + MoneyPipeConstants.L;
    } else if (value >= 1000) {
      return args[0] + (value / 1000).toFixed(2) + MoneyPipeConstants.K;
    } else {
      return args[0] + value.toString();
    }
  }

}
