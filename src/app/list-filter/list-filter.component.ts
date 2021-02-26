import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { KeyValue, LabelServiceService } from '../../api';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface Filter {
  key: string;
  value: string;
}

export interface FilterChangedEvent {
  filters: Filter[];
  filterString?: string;
}

@Component({
  selector: 'app-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss']
})
export class ListFilterComponent implements OnInit {
  filters: Filter[] = [];
  filterCtrl = new FormControl();
  labelOptions = [];
  filteredLabelOptions: Observable<string[]>;
  @ViewChild('filterInput', {static: true}) filterInput: ElementRef<HTMLInputElement>;

  @Input() namespace = '';
  @Input() resource = '';
  @Input() placeholder = 'Filter by label or column...';

  // tslint:disable-next-line:variable-name
  _extraSearchLabels = new Array<KeyValue>();
  @Input() set extraSearchLabels(value: Array<KeyValue>) {
    this._extraSearchLabels = value;

    this.updateAvailableLabels();
  }
  @Output() labelsChanged = new EventEmitter<FilterChangedEvent>();

  availableLabels = new Array<KeyValue>();

  constructor(private labelService: LabelServiceService) {
  }

  ngOnInit() {
    this.getAvailableLabels();

    this.filterCtrl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
    ).subscribe(value => {
      this.getAvailableLabels(value);
    });
  }

  private updateAvailableLabels() {
    const newLabelOptions = [];
    for (const item of this.availableLabels) {
      newLabelOptions.push(`${item.key}: ${item.value}`);
    }


    // The word currently typed in
    const search = this.filterCtrl.value;
    for (const item of this._extraSearchLabels) {
      if (item.key.startsWith(search) || item.value.toLowerCase().startsWith(search)) {
        newLabelOptions.push(`${item.key}: ${item.value}`);
      }
    }

    this.labelOptions = newLabelOptions;
  }

  private getAvailableLabels(startsWith?: string) {
    if (!startsWith || startsWith === '') {
      this.labelOptions = [];
      return;
    }

    let existingLabels = '';
    for (const filter of this.filters) {
      if (existingLabels !== '') {
        existingLabels += ';';
      }
      existingLabels += filter.key;
    }

    this.labelService.getAvailableLabels(this.namespace, this.resource, startsWith, existingLabels)
        .subscribe(res => {
          this.availableLabels = res.labels;
          this.updateAvailableLabels();
        });
  }

  remove(filter: Filter): void {
    const index = this.filters.indexOf(filter);

    if (index >= 0) {
      this.filters.splice(index, 1);
    }

    this.getAvailableLabels();

    this.onFilterChanged();
  }

  autoCompleteSelect(event: MatAutocompleteSelectedEvent) {
    const parts = event.option.value.split(':');
    if (parts.length < 2) {
      return;
    }

    const key = parts[0].trim();
    const value = parts[1].trim();

    if (value.length === 0) {
      this.filterCtrl.setValue(key + ': ');
      this.filterInput.nativeElement.value = key  + ': ';
      return;
    }

    this.filters.push({key, value});

    // Clear the input control
    this.filterCtrl.setValue('');
    this.filterInput.nativeElement.value = '';

    this.labelOptions = [];

    this.onFilterChanged();
  }

  private onFilterChanged() {
    // Label Format: key=<key>,value=<value>&key2=<key2>,value2=<value2>
    let newFilter = '';

    for (const filter of this.filters) {
      if (newFilter !== '') {
        newFilter += '&';
      }

      newFilter += `key=${filter.key},value=${filter.value}`;
    }

    if (newFilter === '') {
      newFilter = undefined;
    }

    this.labelsChanged.emit({
      filters: this.filters.slice(0),
      filterString: newFilter
    });
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.code !== 'Space' && event.code !== 'Enter') {
      return;
    }

    const data: string = this.filterCtrl.value;
    const parts = data.split(':').filter(value => value.trim().length > 0);

    const hasKeyValue = parts.length === 2;
    if (!hasKeyValue) {
      return;
    }

    this.filters.push({
      key: parts[0].trim(),
      value: parts[1].trim()
    });

    // Clear the input control
    this.filterCtrl.setValue('');
    this.filterInput.nativeElement.value = '';

    this.labelOptions = [];

    this.onFilterChanged();
  }
}
