import { Injectable } from '@angular/core';
import * as swal from 'sweetalert2';

interface AlertOptions {
  title: string;
  text: string
  type?: 'error' | 'info';
}

@Injectable()
export class AlertService {

  public alert(opts: AlertOptions): Promise<any> {
    return (<any>swal)({
      titleText: opts.title,
      text: opts.text,
      type: opts.type || 'info'
    }).catch(() => {});
  }

}
