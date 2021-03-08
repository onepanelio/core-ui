/* tslint:disable:max-line-length */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KeyValue } from '../../api';

export interface WorkflowTemplateSelectHeader {
  image: string;
  title: string;
}

export interface WorkflowTemplateSelected {
  name: string;
  manifest: string;
  labels: Array<KeyValue>;
}

export interface WorkflowTemplateSelectItem {
  header: WorkflowTemplateSelectHeader;
  children: Array<WorkflowTemplateSelected>;
}

@Component({
  selector: 'app-workflow-template-select',
  templateUrl: './workflow-template-select.component.html',
  styleUrls: ['./workflow-template-select.component.scss']
})
export class WorkflowTemplateSelectComponent implements OnInit {
  @Input() set selectedTemplate(value: string) {
    if (value !== this.previousSelectedTemplate) {
      this.previousSelectedTemplate = this._selectedTemplate;
    }

    this._selectedTemplate = value;
  }
  get selectedTemplate(): string {
    return this._selectedTemplate;
  }

  constructor() { }

  private static workflowTemplateSamples: WorkflowTemplateSelected[] = [
    {
      name: 'CVAT training',
      manifest: `# Workflow Template for building object detection or semantic segmentation 
# model training Workflow that can be executed from CVAT
#
# Only change the fields marked with [CHANGE]
arguments:
  parameters:
    # [CHANGE] This is the path to your training code repository that will be cloned
    # For private repositories see: https://docs.onepanel.ai/docs/reference/workflows/artifacts#git
    - name: code
      value: https://github.com/onepanelio/templates.git
      displayName: Model training code repository
      type: hidden
      visibility: private

    # [CHANGE] This is the name of branch or tag in your repository that will be used to clone your code
    - name: revision
      value: v0.18.0
      displayName: Model training code repository branch or tag name
      type: hidden
      visibility: private

    # This is the path to data and annotation files
    # Any parameter prefixed with 'cvat-' is automatically populated
    - name: cvat-annotation-path
      # Default value, this will be automatically populated by CVAT
      value: 'artifacts/{{workflow.namespace}}/annotations/'
      # Friendly name to be displayed to user
      displayName: Dataset path
      # Hint to be displayed to user
      hint: Path to annotated data in default object storage. In CVAT, this parameter will be pre-populated.
      # For information on 'visibility', see https://docs.onepanel.ai/docs/reference/workflows/templates/#parameters
      visibility: internal

    # This is the path to a checkpoint, you can set this in CVAT to a previously trained model
    - name: cvat-finetune-checkpoint
      value: ''
      hint: Path to the last fine-tune checkpoint for this model in default object storage. Leave empty if this is the first time you're training this model.
      displayName: Checkpoint path
      visibility: public

    # [CHANGE] Number of classes
    # You can remove this if your code can deduce classes from annotation data
    - name: cvat-num-classes
      displayName: Number of classes
      hint: Number of classes. In CVAT, this parameter will be pre-populated.
      value: '10'
      visibility: internal

    # [CHANGE] Hyperparameters for your model
    # Note that this will come in as multiline YAML that you will need to parse in your code
    # You can also remove this and create a separate parameter for each hyperparameter and pass them as an argument to your script
    - name: hyperparameters
      displayName: Hyperparameters
      visibility: public
      type: textarea.textarea
      value: |-
        num_steps: 1000     #   Num steps per epoch
      hint: List of available hyperparameters

    # [CHANGE] Dump format that your model expects from CVAT
    # Valid values are: cvat_coco, cvat_voc, cvat_tfrecord, cvat_yolo, cvat_mot, cvat_label_me
    - name: dump-format
      value: cvat_coco
      displayName: CVAT dump format
      visibility: private

    # Node pool dropdown (Node group in EKS)
    # You can add more of these if you have additional tasks that can run on different node pools
    - displayName: Node pool
      hint: Name of node pool or group to run this workflow task
      type: select.nodepool
      visibility: public
      name: sys-node-pool
      value: default
      required: true

entrypoint: main
templates:
- dag:
    tasks:
      - name: train-model
        template: train-model
  name: main
- container:
    # [CHANGE] Bash command to run your code
    # Note that your code will be cloned into /mnt/src/train, so you will need to change to the appropriate directory
    args:
      - |
        pip install pycocotools scikit-image==0.16.2 && \\
        cd /mnt/src/train/workflows/maskrcnn-training && \\
        python -u main.py train --dataset=/mnt/data/datasets \\
          --model=workflow_maskrcnn \\
          --extras="{{workflow.parameters.hyperparameters}}" \\
          --ref_model_path="{{workflow.parameters.cvat-finetune-checkpoint}}" \\
          --num_classes="{{workflow.parameters.cvat-num-classes}}"
    command:
      - sh
      - -c
    # [CHANGE] Docker image to use to run your code
    # You can keep this as is if your code uses TensorFlow 2.3 or PyTorch 1.5
    # For private Docker repositories use imagePullSecrets: https://github.com/argoproj/argo/blob/master/examples/image-pull-secrets.yaml#L10-L11
    image: onepanel/dl:0.17.0
    volumeMounts:
      - mountPath: /mnt/data
        name: data
      - mountPath: /mnt/output
        name: output
    workingDir: /mnt/src
  sidecars:
    - name: tensorboard
      image: tensorflow/tensorflow:2.4.1
      command: [ sh, -c ]
      env:
        - name: ONEPANEL_INTERACTIVE_SIDECAR
          value: 'true'
      # [CHANGE] Path to your TensorBoard logs
      # Note that we recommend not changing this and updating your code to write the logs to /mnt/output/tensorboard
      args: [ "tensorboard --logdir /mnt/output/" ]
      ports:
        - containerPort: 6006
          name: tensorboard
  nodeSelector:
    node.kubernetes.io/instance-type: '{{workflow.parameters.sys-node-pool}}'
  inputs:
    artifacts:
      - name: data
        path: /mnt/data/datasets/
        s3:
          key: '{{workflow.parameters.cvat-annotation-path}}'
      - name: models
        path: /mnt/data/models/
        optional: true
        s3:
          key: '{{workflow.parameters.cvat-finetune-checkpoint}}'
      - git:
          repo: '{{workflow.parameters.code}}'
          revision: '{{workflow.parameters.revision}}'
        name: src
        path: /mnt/src/train
  name: train-model
  outputs:
    artifacts:
      - name: model
        optional: true
        path: /mnt/output

# [CHANGE] Volumes that will mount to /mnt/data (annotated data) and /mnt/output (models, checkpoints, logs)
# Update this depending on your annotation data, model, checkpoint, logs, etc. sizes
# Example values: 250Mi, 500Gi, 1Ti
volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 200Gi
  - metadata:
      name: output
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 200Gi`,
      labels: [
        {key: 'used-by', value: 'cvat'}
      ]
    },
    {
      name: 'Data augmentation',
      manifest: `# Workflow Template for data augmentation using Albumentations
# This can be used standalone or added to the CVAT training template
#
# Only change the fields marked with [CHANGE]
arguments:
  parameters:

    # This is the path to data and annotation files, keep this intact so CVAT knows to populate this
    - name: cvat-annotation-path
      # Default value, this will be automatically populated by CVAT
      value: 'artifacts/{{workflow.namespace}}/annotations/'
      # Friendly name to be displayed to user
      displayName: Dataset path
      # Hint to be displayed to user
      hint: Path to annotated data in default object storage. In CVAT, this parameter will be pre-populated.
      # For information on 'visibility', see https://docs.onepanel.ai/docs/reference/workflows/templates/#parameters
      visibility: internal
      
    - name: val-split
      value: 20
      displayName: Validation split size
      type: input.number
      visibility: public
      hint: Enter validation set size in percentage of full dataset. (0 - 100)
      
    - name: num-augmentation-cycles
      value: 1
      displayName: Number of augmentation cycles
      type: input.number
      visibility: public
      hint: Number of augmentation cycles, zero means no data augmentation

    - name: preprocessing-parameters
      value: |-
        RandomBrightnessContrast:
            p: 0.2
        GaussianBlur:
            p: 0.3
        GaussNoise:
            p: 0.4
        HorizontalFlip:
            p: 0.5
        VerticalFlip:
            p: 0.3
      displayName: Preprocessing parameters
      visibility: public
      type: textarea.textarea
      hint: 'See <a href="https://albumentations.ai/docs/api_reference/augmentations/transforms/" target="_blank">documentation</a> for more information on parameters.'

    # [CHANGE] Dump format that your model expects from CVAT
    # Valid values are: cvat_coco, cvat_voc, cvat_tfrecord, cvat_yolo, cvat_mot, cvat_label_me
    - name: dump-format
      value: cvat_coco
      displayName: CVAT dump format
      visibility: private

    # Node pool dropdown (Node group in EKS)
    # You can add more of these if you have additional tasks that can run on different node pools
    - displayName: Node pool
      hint: Name of node pool or group to run this workflow task
      name: preprocessing-node-pool
      value: default
      visibility: internal
      required: true

entrypoint: main
templates:
  - dag:
      tasks:
        - name: preprocessing-phase
          template: preprocessing
    name: main
  - container:
      args:
        - |
          pip install pycocotools && \\
          cd /mnt/src/preprocessing/workflows/albumentations-preprocessing && \\
          python main.py \\
            --data_aug_params="{{workflow.parameters.preprocessing-parameters}}" \\
            --val_split={{workflow.parameters.val-split}} \\
            --aug_steps={{workflow.parameters.num-augmentation-cycles}}
      command:
        - sh
        - -c
      image: '{{workflow.parameters.preprocessing-image}}'
      volumeMounts:
        - mountPath: /mnt/data
          name: data
        - mountPath: /mnt/output
          name: output
      workingDir: /mnt/src
    nodeSelector:
      node.kubernetes.io/instance-type: '{{workflow.parameters.preprocessing-node-pool}}'
    inputs:
      artifacts:
        - name: data
          path: /mnt/data/datasets/
          s3:
            key: '{{workflow.parameters.cvat-annotation-path}}'
        - git:
            repo: https://github.com/onepanelio/templates.git
          name: src
          path: /mnt/src/preprocessing
    name: preprocessing
    outputs:
      artifacts:
        - name: processed-data
          optional: true
          path: /mnt/output

# [CHANGE] Volumes that will mount to /mnt/data (annotated data) and /mnt/output (models, checkpoints, logs)
# Update this depending on your annotation data, model, checkpoint, logs, etc. sizes
# Example values: 250Mi, 500Gi, 1Ti
volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 200Gi
  - metadata:
      name: output
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 200Gi`,
      labels: [
        {key: 'used-by', value: 'cvat'}
      ]
    },
    {
      name: 'Hyperparameter tuning',
      manifest: `# Workflow Template example for hyperparameter tuning
# Documentation: https://docs.onepanel.ai/docs/reference/workflows/hyperparameter-tuning
#
# Only change the fields marked with [CHANGE]
entrypoint: main
arguments:
  parameters:

    # [CHANGE] Path to your training/model architecture code repository
    # Change this value and revision value to your code repository and branch respectively
    - name: source
      value: https://github.com/onepanelio/templates

    # [CHANGE] Revision is the branch or tag that you want to use
    # You can change this to any tag or branch name in your repository
    - name: revision
      value: v0.18.0

    # [CHANGE] Default configuration for the NNI tuner
    # See https://docs.onepanel.ai/docs/reference/workflows/hyperparameter-tuning#understanding-the-configurations
    - name: config
      displayName: Configuration
      required: true
      hint: NNI configuration
      type: textarea.textarea
      value: |-
        experimentName: MNIST TF v2.x
        maxExperimentDuration: 1h
        maxTrialNumber: 10
        trainingService:
          platform: local
          useActiveGpu: True
        tuner:
          name: TPE                  # choices: TPE, Random, Anneal, Evolution, BatchTuner, MetisTuner, GPTuner
          classArgs:
            optimize_mode: maximize  # choices: maximize, minimize
        trialConcurrency: 1
        trialGpuNumber: 0            # update number to number of GPUs if GPU is present
        trialCommand: python main.py --output /mnt/output
        # [CHANGE] Search space configuration
        # Change according to your hyperparameters and ranges
        searchSpace:
          dropout_rate:
            _type: uniform
            _value: [0.5,0.9]
          conv_size:
            _type: choice
            _value: [2,3,5,7]
          hidden_size:
            _type: choice
            _value: [124,512,1024]
          batch_size:
            _type: choice
            _value: [16,32]
          learning_rate:
            _type: choice
            _value: [0.0001,0.001,0.01,0.1]
          epochs:
            _type: choice
            _value: [10]

    # Node pool dropdown (Node group in EKS)
    # You can add more of these if you have additional tasks that can run on different node pools
    - displayName: Node pool
      hint: Name of node pool or group to run this workflow task
      type: select.nodepool
      name: sys-node-pool
      value: default
      required: true

templates:
  - name: main
    dag:
      tasks:
        - name: hyperparameter-tuning
          template: hyperparameter-tuning
        - name: metrics-writer
          template: metrics-writer
          dependencies: [hyperparameter-tuning]
          arguments:
            # Use sys-metrics artifact output from hyperparameter-tuning Task
            # This writes the best metrics to the Workflow
            artifacts:
              - name: sys-metrics
                from: "{{tasks.hyperparameter-tuning.outputs.artifacts.sys-metrics}}"
  - name: hyperparameter-tuning
    inputs:
      artifacts:
        - name: src
          # Clone the above repository into '/mnt/data/src'
          # See https://docs.onepanel.ai/docs/reference/workflows/artifacts#git for private repositories
          git:
            repo: '{{workflow.parameters.source}}'
            revision: '{{workflow.parameters.revision}}'
          path: /mnt/data/src
        # [CHANGE] Path where config.yaml will be generated or already exists
        # Update the path below so that config.yaml is written to the same directory as your main.py file
        # Note that your source code is cloned to /mnt/data/src
        - name: config
          path: /mnt/data/src/workflows/hyperparameter-tuning/mnist/config.yaml
          raw:
            data: '{{workflow.parameters.config}}'
    outputs:
      artifacts:
        - name: output
          path: /mnt/output
          optional: true
    container:
      image: onepanel/dl:v0.20.0
      command:
      - sh
      - -c
      args:
        # [CHANGE] Update the path below to point to your code and config.yaml path as described above
        # Note that you can "pip install" additional tools here if necessary
        - |
          cd /mnt/data/src/workflows/hyperparameter-tuning/mnist/ && \\
          python -u /opt/onepanel/nni/start.py --config config.yaml
      workingDir: /mnt
      volumeMounts:
        - name: hyperparamtuning-data
          mountPath: /mnt/data
        - name: hyperparamtuning-output
          mountPath: /mnt/output
    nodeSelector:
      node.kubernetes.io/instance-type: '{{workflow.parameters.sys-node-pool}}'
    sidecars:
      - name: nni-web-ui
        image: onepanel/nni-web-ui:0.17.0
        env:
          - name: ONEPANEL_INTERACTIVE_SIDECAR
            value: 'true'
        ports:
          - containerPort: 9000
            name: nni
      - name: tensorboard
        image: onepanel/dl:v0.20.0
        command:
          - sh
          - '-c'
        env:
          - name: ONEPANEL_INTERACTIVE_SIDECAR
            value: 'true'
        args:
          # Read logs from /mnt/output/tensorboard - /mnt/output is auto-mounted from volumeMounts
          - tensorboard --logdir /mnt/output/tensorboard
        ports:
          - containerPort: 6006
            name: tensorboard
  # Use the metrics-writer tasks to write best metrics to Workflow
  - name: metrics-writer
    inputs:
      artifacts:
      - name: sys-metrics
        path: /tmp/sys-metrics.json
      - git:
          repo: https://github.com/onepanelio/templates.git
          revision: v0.18.0
        name: src
        path: /mnt/src
    container:
      image: onepanel/python-sdk:v0.16.0
      command:
        - python
        - -u
      args:
        - /mnt/src/tasks/metrics-writer/main.py
        - --from_file=/tmp/sys-metrics.json

# [CHANGE] Volumes that will mount to /mnt/data (annotated data) and /mnt/output (models, checkpoints, logs)
# Update this depending on your annotation data, model, checkpoint, logs, etc. sizes
# Example values: 250Mi, 500Gi, 1Ti
volumeClaimTemplates:
  - metadata:
      name: hyperparamtuning-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi
  - metadata:
      name: hyperparamtuning-output
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi`,
      labels: []
    }
  ];
  @Output() templateSelected = new EventEmitter<WorkflowTemplateSelected>();
  previousSelectedTemplate: string = null;

  // tslint:disable-next-line:variable-name
  _selectedTemplate = 'new';

  @Input() items: Array<WorkflowTemplateSelectItem> = [{
    header: {
      title: 'Blank template',
      image: '/assets/images/workflows-blank-icon.svg'
    }, children: [{
      name: 'New',
      manifest: '',
      labels: [],
    }]
  }, {
    header: {
      title: 'Templates',
      image: '/assets/images/workflows-templates-icon.svg'
    }, children: WorkflowTemplateSelectComponent.workflowTemplateSamples
  }];

  ngOnInit() {
  }

  selectTemplate(name: string) {
    this.selectedTemplate = name;

    const workflowTemplateList = this.items.find(list => {
      return list.children.find(item => item.name === name);
    });

    if (!workflowTemplateList) {
      return;
    }

    const workflowTemplateItem = workflowTemplateList.children.find(item => item.name === name);

    if (!workflowTemplateItem) {
      return;
    }

    this.templateSelected.emit(workflowTemplateItem);
  }

  undo() {
    this.selectedTemplate = this.previousSelectedTemplate;
  }
}
