import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

enum ConTeValidators {
  Required = 'required',
  Regex = 'regex',
  MaxLength = 'maxLength',
  MinLength = 'minLength',
}

interface ConTeValidatorFunction {
  hasParam: boolean;
  validatorCallback: Function;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  form: FormGroup;
  validatorMap = new Map<ConTeValidators, ConTeValidatorFunction>([
    [
      ConTeValidators.Required,
      { hasParam: false, validatorCallback: () => Validators.required },
    ],
    [
      ConTeValidators.Regex,
      {
        hasParam: true,
        validatorCallback: (pattern: RegExp) => Validators.pattern(pattern),
      },
    ],
    [
      ConTeValidators.MaxLength,
      {
        hasParam: true,
        validatorCallback: (maxLength: number) =>
          Validators.maxLength(maxLength),
      },
    ],
    [
      ConTeValidators.MinLength,
      {
        hasParam: true,
        validatorCallback: (minLength: number) =>
          Validators.minLength(minLength),
      },
    ],
  ]);

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  get questionnaire() {
    return this.form.get('questionnaire') as FormArray;
  }

  ngOnInit() {
    this.form = this.fb.group({
      questionnaire: this.fb.array([]),
    });

    this.http
      .get<any>('./assets/form.json')
      .subscribe(({ questionnaire }) => this.buildFormArray(questionnaire));
  }

  // TODO: Add type
  buildFormArray(formResponse: any[]) {
    formResponse.forEach((question) => this.addQuestion(question));
  }

  addQuestion({ prefilledValue, rules }) {
    this.questionnaire.push(
      this.fb.control(prefilledValue, [...this.extractValidators(rules)])
    );
  }

  extractValidators(rules: any[]): any[] {
    return rules.map((rule) => {
      const key = Object.keys(rule)[0] as ConTeValidators;
      const { hasParam, validatorCallback } = this.validatorMap.get(key);

      if (hasParam) return validatorCallback(rule[key]);

      return validatorCallback();
    });
  }
}
