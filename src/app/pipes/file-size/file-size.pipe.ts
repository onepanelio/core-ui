import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  private static units = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
  ];

  transform(bytes: any = 0, precision = 1, round = false): string {
    return FileSizePipe.BytesToSize(bytes, precision, round);
  }

  static BytesToSize(bytes = 0, precision = 0, round = true): string {
    if (isNaN(parseFloat(String(bytes))) || ! isFinite(bytes)) return '?';

    if (typeof bytes === 'string') {
      bytes = parseInt(bytes);
    }

    let unit = 0;

    while (bytes >= 1024) {
      bytes /= 1024;
      unit++;
    }

    if (round) {
      bytes = Math.round(bytes);
    }

    return bytes.toFixed(+precision) + ' ' + FileSizePipe.units[unit];
  }
}
