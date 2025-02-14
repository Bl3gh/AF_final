import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartContainer!: ElementRef;
  statsData: any;

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.statisticsService.getStatistics().subscribe((data: any) => {
      this.statsData = data;
      this.buildCharts();
    });
  }

  ngAfterViewInit(): void {
    // Возможно, отложим отрисовку до получения данных
  }

  buildCharts(): void {
    // Пример построения простого line chart с d3
    const element = this.chartContainer.nativeElement;
    const data = this.statsData.books_by_month || [];
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseTime = d3.timeParse("%Y-%m");
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    data.forEach((d: { month: string | Date; count: number; }) => {
      if (typeof d.month === 'string') {
        const parsed = parseTime(d.month);
        if (parsed) {
          d.month = parsed;
        }
      }
      d.count = +d.count;
    });
    
    
    // Теперь можно корректно задать домен:
    x.domain(d3.extent(data, (d: { month: Date; }) => d.month) as [Date, Date]);
    y.domain([0, d3.max(data, (d: { count: number; }) => d.count) as number]);

    const valueline = d3.line<any>()
      .x((d: { month: any; }) => x(d.month))
      .y((d: { count: any; }) => y(d.count));

    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', valueline)
      .attr('stroke', 'steelblue')
      .attr('fill', 'none');

  }
}
