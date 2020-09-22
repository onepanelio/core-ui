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
      name: 'Model training',
      manifest: `arguments:
  parameters:

  # following are a list of parameters that might change based on user response.
  # some of these parameters are prefixed with cvat- to denote that they are special parameters and will be automatically populated by CVAT.
  # you can change the names, but changing names of special parameters might break the workflow.

  # Github url for source code
  # This will be mounted to the container
  # Setting visibility to private ensures that it does not appear in CVAT as the source code is fixed
  # You can, in fact, remove this from parameters and fix it in the artifacts below. This is just for demo.
  - name: source
    value: https://github.com/onepanelio/Mask_RCNN.git
    displayName: Model source code
    type: hidden
    visibility: private

  # Input path for this workflow
  # The value will be automatically populated by CVAT, if you will run this from CVAT.
  - name: cvat-annotation-path
    value: annotation-dump/sample_dataset
    hint: Path to annotated data in default object storage (i.e S3). In CVAT, this parameter will be pre-populated.
    displayName: Dataset path
    visibility: internal

  # Output path for this workflow
  # The value will be automatically populated by CVAT, if you will run this from CVAT.
  - name: cvat-output-path
    value: workflow-data/output/sample_output
    hint: Path to store output artifacts in default object storage (i.e s3). In CVAT, this parameter will be pre-populated.
    displayName: Workflow output path
    visibility: internal

  # Path to checkpoint
  # Since Onepanel has a filesyncer, all possible values will be displayed in the CVAT
  - name: cvat-finetune-checkpoint
    value: ''
    hint: Select the last fine-tune checkpoint for this model. It may take up to 5 minutes for a recent checkpoint show here. Leave empty if this is the first time you're training this model.
    displayName: Checkpoint path
    visibility: public

  # Number of classes
  # If you run this from CVAT, it will automatically populate this field based on number of labels in the given CVAT task.
  # Note: MaskRCNN requires an extra class for background, so CVAT adds that one whenever workflow's name == "maskrcnn-training".
  # You workflow name will be different, so this won't work out of the box.
  # Most probably you will have your own source code, so this won't be a problem.
  - name: cvat-num-classes
    displayName: Number of classes
    hint: Number of classes (i.e in CVAT taks) + 1 for background
    value: 81
    visibility: internal

  # A set of hyperparameters used by the source code
  - name: hyperparameters
    displayName: Hyperparameters
    visibility: public
    type: textarea.textarea
    value: |-
      stage-1-epochs=1    #  Epochs for network heads
      stage-2-epochs=2    #  Epochs for finetune layers
      stage-3-epochs=3    #  Epochs for all layers
    hint: "Please refer to our <a href='https://docs.onepanel.ai/docs/getting-started/use-cases/computervision/annotation/cvat/cvat_annotation_model#arguments-optional' target='_blank'>documentation</a> for more information on parameters. Number of classes will be automatically populated if you had 'sys-num-classes' parameter in a workflow."

  # This helps CVAT determine in which format it should dump the data.
  # Common ones are: cvat_coco, cvat_tfrecord, cvat_yolo
  - name: dump-format
    value: cvat_coco
    displayName: CVAT dump format
    visibility: public

  # Docker image to use for this workflow
  # You can use any public image here (i.e PyTorch)
  # The jupyterlab image from Onepanel has latest TensorFlow, PyTorch and many dependencies pre-installed
  - name: docker-image
    visibility: public
    value: tensorflow/tensorflow:1.13.1-py3
    type: select.select
    displayName: Select TensorFlow image
    hint: Select the GPU image if you are running on a GPU node pool
    options:
    - name: 'TensorFlow 1.13.1 CPU Image'
      value: 'tensorflow/tensorflow:1.13.1-py3'
    - name: 'TensorFlow 1.13.1 GPU Image'
      value: 'tensorflow/tensorflow:1.13.1-gpu-py3'
    - name: 'Onepanel JupyterLab'
      value: 'onepanel/jupyterlab:1.0.1'

  # Select a node for the workflow execution
  # In CVAT as well as Onepanel, it will be automatically populated based on your cluster settings.
  - displayName: Node pool
    hint: Name of node pool or group to run this workflow task
    type: select.select
    visibility: public
    name: sys-node-pool
    value: Standard_D4s_v3
    required: true
    options:
    - name: 'CPU: 2, RAM: 8GB'
      value: Standard_D2s_v3
    - name: 'CPU: 4, RAM: 16GB'
      value: Standard_D4s_v3
    - name: 'GPU: 1xK80, CPU: 6, RAM: 56GB'
      value: Standard_NC6

entrypoint: main
templates:
- dag:
    tasks:
    - name: train-model
      template: tensorflow
  name: main
- container:

    # A set of arguments you want to execute in the container to start training/inference.
    args:
    - |
      apt-get update \\
      && apt-get install -y git wget libglib2.0-0 libsm6 libxext6 libxrender-dev \\
      && pip install -r requirements.txt \\
      && pip install boto3 pyyaml google-cloud-storage \\
      && git clone https://github.com/waleedka/coco \\
      && cd coco/PythonAPI \\
      && python setup.py build_ext install \\
      && rm -rf build \\
      && cd ../../ \\
      && wget https://github.com/matterport/Mask_RCNN/releases/download/v2.0/mask_rcnn_coco.h5 \\
      && python setup.py install && ls \\
      && python samples/coco/cvat.py train --dataset=/mnt/data/datasets \\
        --model=workflow_maskrcnn \\
        --extras="{{workflow.parameters.hyperparameters}}"  \\
        --ref_model_path="{{workflow.parameters.cvat-finetune-checkpoint}}"  \\
        --num_classes="{{workflow.parameters.cvat-num-classes}}" \\
      && cd /mnt/src/ \\
      && python prepare_dataset.py /mnt/data/datasets/annotations/instances_default.json
    command:
    - sh
    - -c
    image: '{{workflow.parameters.docker-image}}'
    volumeMounts:
    - mountPath: /mnt/data
      name: data
    - mountPath: /mnt/output
      name: output
    workingDir: /mnt/src
  nodeSelector:
    beta.kubernetes.io/instance-type: '{{workflow.parameters.sys-node-pool}}'
  inputs:
    artifacts:
    - name: data
      path: /mnt/data/datasets/
      s3:
        key: '{{workflow.namespace}}/{{workflow.parameters.cvat-annotation-path}}'
    - git:
        repo: '{{workflow.parameters.source}}'
        revision: "no-boto"
      name: src
      path: /mnt/src
  name: tensorflow
  outputs:
    artifacts:
    - name: model
      optional: true
      path: /mnt/output
      s3:
        key: '{{workflow.namespace}}/{{workflow.parameters.cvat-output-path}}/{{workflow.name}}'

volumeClaimTemplates:
- metadata:
    creationTimestamp: null
    name: data
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 200Gi
- metadata:
    creationTimestamp: null
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
