import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-bar',
  templateUrl: './stat-bar.component.html',
  styleUrls: ['./stat-bar.component.scss']
})
export class StatBarComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  private _maxValue = 0.0;

  // tslint:disable-next-line:variable-name
  private _value = 0;
  barPercentage = '0';

  @Input() title: string;
  @Input() set value(value: number|undefined) {
    if (value === undefined) {
      value = 0;
    }

    this._value = value;

    this.updateBarPercentage();
  }
  get value(): number {
    return this._value;
  }

  @Input() set maxValue(maxValue: number|undefined) {
    if (maxValue === undefined) {
      maxValue = 0;
    }

    this._maxValue = maxValue;

    this.updateBarPercentage();
  }
  get maxValue(): number {
    return this._maxValue;
  }

  @Input() color = '#FF0000';

  constructor() { }

  ngOnInit() {
  }

  private updateBarPercentage() {
    if (!this.maxValue) {
      this.barPercentage = '0';
      return;
    }

    const percentage = this._value / this.maxValue * 100.0;
    this.barPercentage = `${percentage}%`;
  }
}
