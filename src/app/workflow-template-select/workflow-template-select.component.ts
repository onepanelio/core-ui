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
      manifest: `# Only change the fields marked with [CHANGE]
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

    # This is the path to a checkpoint, you can set this in CVAT to a previously trained model
    - name: cvat-finetune-checkpoint
      value: ''
      hint: Path to the last fine-tune checkpoint for this model in default object storage. Leave empty if this is the first time you're training this model.
      displayName: Checkpoint path
      visibility: public

    # Number of classes
    - name: cvat-num-classes
      displayName: Number of classes
      hint: Number of classes. In CVAT, this parameter will be pre-populated.
      value: '10'
      visibility: internal

    # [CHANGE] Hyperparameters for your model
    # Note that this will come in as multiline text that you will need to parse in your code
    - name: hyperparameters
      displayName: Hyperparameters
      visibility: public
      type: textarea.textarea
      value: |-
        stage-1-epochs: 1    #  Epochs for network heads
        stage-2-epochs: 2    #  Epochs for finetune layers
        stage-3-epochs: 3    #  Epochs for all layers
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
        cd /mnt/src/train/workflows/maskrcnn-training && \\
          python -u main.py train --dataset=/mnt/data/datasets \\
          --model=workflow_maskrcnn \\
          --extras="{{workflow.parameters.hyperparameters}}" \\
          --ref_model_path="{{workflow.parameters.cvat-finetune-checkpoint}}" \\
          --num_classes="{{workflow.parameters.cvat-num-classes}}" \\
          --logs=/mnt/output
    command:
      - sh
      - -c
    # [CHANGE] Docker image to use to run your code
    # You can keep this as is if your code uses TensorFlow 2.3 or PyTorch 1.5
    # For private Docker repositories use imagePullSecrets: https://github.com/argoproj/argo/blob/master/examples/image-pull-secrets.yaml#L10-L11
    image: 'onepanel/dl:0.17.0'
    volumeMounts:
      - mountPath: /mnt/data
        name: data
      - mountPath: /mnt/output
        name: output
    workingDir: /mnt/src
  sidecars:
    - name: tensorboard
      image: 'onepanel/dl:0.17.0'
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
          # [CHANGE] Point this to your code repository
          # For private repositories see: https://docs.onepanel.ai/docs/reference/workflows/artifacts#git
          repo: https://github.com/onepanelio/templates.git
        name: src
        path: /mnt/src/train
  name: train-model
  outputs:
    artifacts:
      - name: model
        optional: true
        path: /mnt/output
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
      name: 'Ensemble inference',
      manifest: `arguments:
  parameters:
  
  # Following are a list of parameters that might change based on user response.
  # some of these parameters are prefixed with cvat- to denote that they are special parameters and will be automatically populated by CVAT.
  # you can change the names, but changing names of special parameters might break the workflow.

  # Path to input data for this workflow
  - name: cvat-annotation-path
    value: annotation-dump/test-workflow-4/test/
    displayName: Path to dataset
    visibility: internal

  # Which ensemble strategy to use
  - name: ensemble-option
    value: unanimous
    visibility: public
    type: select.select
    displayName: Ensemble strategy
    hint: Select the ensemble strategy to use
    options:
    - name: 'Consensus'
      value: 'consensus'
    - name: 'Unanimous'
      value: 'unanimous'
    - name: 'Affirmative'
      value: 'affirmative'

  # Where to store the output files
  - name: cvat-output-path
    value: workflow-data/output/test-workflow-4/model-comparison66/
    visibility: internal

  # Dump format for CVAT. The code has been written to accept data in COCO format, so select cvat_coco.
  # Having a correct dump-format in a template ensures that you don't have to select in the CVAT.
  - name: dump-format
    value: cvat_coco
    displayName: CVAT dump format
    visibility: public

entrypoint: main
templates:
  - name: main
    dag:
      tasks:

      # A sample preprocessing container where you preprocess your data.
      # This does not do anything, but you can add your script to this container.
      - name: process-input-data
        template: bash

      # First container to run prediction using YOLO.
      - name: predict-yolo-model
        dependencies: [process-input-data]
        template: yolo

      # Second container to run the inference.
      - name: predict-retinanet-model
        dependencies: [process-input-data]
        template: retinanet

      # Container which performs the ensembling.
      - name: ensemble
        dependencies: [predict-yolo-model, predict-retinanet-model]
        template: ensemble

   # Retinanet container
  - name: retinanet
    inputs:
      artifacts:
      - name: src
        path: /mnt/src
        git:
          repo: "https://github.com/onepanelio/ensembleObjectDetection.git"
      - name: data
        path: /mnt/data/datasets/
        s3:
          key: '{{workflow.namespace}}/{{workflow.parameters.cvat-annotation-path}}'
    outputs:
      artifacts:
      - name: model
        path: /mnt/output
        optional: true
        s3:
          key: '{{workflow.namespace}}/{{workflow.parameters.cvat-output-path}}/{{workflow.name}}'
    container:
      image: onepanel/jupyterlab:1.0.1
      command: [sh,-c]
      args:
      - |
        apt update \\
        && apt install libgl1-mesa-glx ffmpeg libsm6 libxext6 libglib2.0-0 libxext6 libxrender-dev wget unzip git -y \\
        && bash setup.sh \\
        && pip install ./keras-retinanet/ --user \\
        && python TestTimeAugmentation/run.py --images_path=/mnt/data/datasets/images --models=retinanet --option={{workflow.parameters.ensemble-option}} --combine=False \\
      workingDir: /mnt/src

  # YOLO container
  - name: yolo
    inputs:
      artifacts:
      - name: src
        path: /mnt/src
        git:
          repo: "https://github.com/onepanelio/ensembleObjectDetection.git"
      - name: data
        path: /mnt/data/datasets/
        s3:
          key: '{{workflow.namespace}}/{{workflow.parameters.cvat-annotation-path}}'
    outputs:
      artifacts:
      - name: model
        path: /mnt/output
        optional: true
        s3:
          key: '{{workflow.namespace}}/{{workflow.parameters.cvat-output-path}}/{{workflow.name}}'
    container:
      image: onepanel/jupyterlab:1.0.1
      command: [sh,-c]
      args:
       - |
        apt update \\
        && apt install libgl1-mesa-glx ffmpeg libsm6 libxext6 libglib2.0-0 libxext6 libxrender-dev wget unzip -y \\
        && bash setup.sh \\
        && python TestTimeAugmentation/run.py --images_path=/mnt/data/datasets/images --models=yolo_darknet --option={{workflow.parameters.ensemble-option}} --combine=False \\
      workingDir: /mnt/src
      volumeMounts:
      - name: output
        mountPath: /mnt/output

  # Ensemble container
  - name: ensemble
    inputs:
      artifacts:
      - name: src
        path: /mnt/src
        git:
          repo:  "https://github.com/onepanelio/ensembleObjectDetection.git"
      - name: data
        path: /mnt/data/datasets/
        s3:
          key: '{{workflow.namespace}}/{{workflow.parameters.cvat-output-path}}{{workflow.name}}'
      - name: dataorig
        path: /mnt/data/dataorig/
        s3:
          key: '{{workflow.namespace}}/{{workflow.parameters.cvat-annotation-path}}'
    outputs:
      artifacts:
      - name: model
        path: /mnt/output
        optional: true
        # if you want to store output on cloud storage, you should replace following lines with
        # s3 or gcs as shown above.
        archive:
          none: {}
    container:
      image: onepanel/jupyterlab:1.0.1
      command: [sh, -c]
      args:
       - |
        apt update \\
        && apt install libgl1-mesa-glx ffmpeg libsm6 libxext6 libglib2.0-0 libxext6 libxrender-dev wget unzip -y \\
        && bash setup.sh \\
        && python TestTimeAugmentation/run.py --images_path=/mnt/data/datasets/ --models=yolo_darknet,retinanet --option={{workflow.parameters.ensemble-option}} --combine=True \\
      workingDir: /mnt/src

  - name: bash
    container:
      args:
      - sleep 15
      command:
      - bash
      - -c
      image: bash

volumeClaimTemplates:
  - metadata:
      name: output
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi`,
      labels: [
        {key: 'used-by', value: 'cvat'}
      ]
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
