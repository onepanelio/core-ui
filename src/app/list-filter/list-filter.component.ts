import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { LabelServiceService } from '../../api';
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
  @Input() placeholder = 'Filter';
  @Output() labelsChanged = new EventEmitter<FilterChangedEvent>();

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
          const newLabelOptions = [];
          if (res.labels) {
            for (const item of res.labels) {
              newLabelOptions.push(`${item.key}: ${item.value}`);
            }
          }

          this.labelOptions = newLabelOptions;
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
}
